// PATH: Backend/src/main/java/com/virtuehire/service/ResumeService.java

package com.virtuehire.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.virtuehire.model.Candidate;
import com.virtuehire.model.ResumeDocument;
import com.virtuehire.repository.ResumeDocumentRepository;
import com.virtuehire.util.StoragePathResolver;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    private static final TypeReference<LinkedHashMap<String, Object>> MAP_TYPE = new TypeReference<>() {};
    private static final List<String> REQUIRED_SECTIONS = List.of(
            "personalInfo", "professionalSummary", "skills", "education",
            "experience", "projects", "certifications", "achievements", "keywords");

    private final ResumeDocumentRepository resumeDocumentRepository;
    private final ObjectMapper objectMapper;
    private final Path resumeDir;
    private final Path uploadDir; // ← ADDED: root upload dir for candidate-uploaded files

    public ResumeService(
            ResumeDocumentRepository resumeDocumentRepository,
            ObjectMapper objectMapper,
            @Value("${file.upload-dir}") String uploadDirPath) {
        this.resumeDocumentRepository = resumeDocumentRepository;
        this.objectMapper = objectMapper;
        this.uploadDir = StoragePathResolver.resolveUploadDir(uploadDirPath);
        this.resumeDir = this.uploadDir.resolve("generated-resumes");
    }

    public List<Map<String, Object>> listCandidateResumes(Long candidateId) {
        return resumeDocumentRepository.findByCandidateIdOrderByUpdatedAtDesc(candidateId).stream()
                .map(this::toResumeResponse)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getCandidateResume(Long candidateId, Long resumeId) {
        ResumeDocument resumeDocument = resumeDocumentRepository.findByIdAndCandidateId(resumeId, candidateId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
        return toResumeResponse(resumeDocument);
    }

    @Transactional
    public Map<String, Object> createResume(Candidate candidate, Map<String, Object> payload) throws IOException {
        ResumeDocument resumeDocument = new ResumeDocument();
        resumeDocument.setCandidate(candidate);
        return saveResume(resumeDocument, payload, true);
    }

    @Transactional
    public Map<String, Object> updateResume(Long candidateId, Long resumeId, Map<String, Object> payload) throws IOException {
        ResumeDocument existing = resumeDocumentRepository.findByIdAndCandidateId(resumeId, candidateId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
        return saveResume(existing, payload, false);
    }

    @Transactional
    public void deleteResume(Long candidateId, Long resumeId) {
        ResumeDocument existing = resumeDocumentRepository.findByIdAndCandidateId(resumeId, candidateId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
        deleteGeneratedFile(existing.getPdfPath());
        resumeDocumentRepository.delete(existing);
    }

    @Transactional
    public void deleteCandidateResumes(Long candidateId) {
        List<ResumeDocument> resumes = resumeDocumentRepository.findByCandidateId(candidateId);
        for (ResumeDocument resume : resumes) {
            deleteGeneratedFile(resume.getPdfPath());
        }
        resumeDocumentRepository.deleteAll(resumes);
    }

    public Path resolveResumePdf(Long candidateId, Long resumeId) {
        ResumeDocument resumeDocument = resumeDocumentRepository.findByIdAndCandidateId(resumeId, candidateId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
        Path filePath = resumeDir.resolve(resumeDocument.getPdfPath()).normalize();
        if (!Files.exists(filePath)) {
            try {
                if (!Files.exists(resumeDir)) {
                    Files.createDirectories(resumeDir);
                }
                generatePdf(
                        readResumeData(resumeDocument.getResumeDataJson()),
                        firstNonBlank(resumeDocument.getTitle(), buildDefaultTitle(readResumeData(resumeDocument.getResumeDataJson()))),
                        firstNonBlank(resumeDocument.getTemplateId(), "classic-professional"),
                        filePath);
            } catch (IOException ex) {
                throw new RuntimeException("Resume PDF not found", ex);
            }
        }
        if (!Files.exists(filePath)) {
            throw new RuntimeException("Resume PDF not found");
        }
        return filePath;
    }

    public String getResumePdfName(Long candidateId, Long resumeId) {
        ResumeDocument resumeDocument = resumeDocumentRepository.findByIdAndCandidateId(resumeId, candidateId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
        return resumeDocument.getPdfPath();
    }

    // ── ADDED: resolves a candidate-uploaded file (resumePath) by filename ──
    public Path resolveFileByName(String filename) {
        return uploadDir.resolve(filename).normalize();
    }

    private Map<String, Object> saveResume(ResumeDocument resumeDocument, Map<String, Object> payload, boolean creating)
            throws IOException {
        Map<String, Object> resumeData = normalizeResumeData(payload);
        Map<String, Object> atsResult = calculateAtsScore(resumeData);

        if (!Files.exists(resumeDir)) {
            Files.createDirectories(resumeDir);
        }

        if (!creating) {
            deleteGeneratedFile(resumeDocument.getPdfPath());
        }

        String title = firstNonBlank(asString(payload.get("title")), buildDefaultTitle(resumeData));
        String templateId = firstNonBlank(asString(payload.get("templateId")), "classic-professional");
        String pdfName = buildPdfName(title);

        resumeDocument.setTitle(title);
        resumeDocument.setTemplateId(templateId);
        resumeDocument.setResumeDataJson(objectMapper.writeValueAsString(resumeData));
        resumeDocument.setPdfPath(pdfName);
        resumeDocument.setAtsScore((Integer) atsResult.get("score"));
        resumeDocument.setMissingKeywords(String.join(", ", castStringList(atsResult.get("missingKeywords"))));
        resumeDocument.setSuggestions(String.join(" || ", castStringList(atsResult.get("suggestions"))));
        resumeDocument.setUpdatedAt(LocalDateTime.now());

        generatePdf(resumeData, title, templateId, resumeDir.resolve(pdfName));

        ResumeDocument saved = resumeDocumentRepository.save(resumeDocument);
        return toResumeResponse(saved);
    }

    private Map<String, Object> toResumeResponse(ResumeDocument resumeDocument) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", resumeDocument.getId());
        response.put("title", resumeDocument.getTitle());
        response.put("templateId", resumeDocument.getTemplateId());
        response.put("atsScore", resumeDocument.getAtsScore());
        response.put("createdAt", resumeDocument.getCreatedAt());
        response.put("updatedAt", resumeDocument.getUpdatedAt());
        response.put("pdfPath", resumeDocument.getPdfPath());
        response.put("resumeData", readResumeData(resumeDocument.getResumeDataJson()));
        response.put("missingKeywords", splitStoredText(resumeDocument.getMissingKeywords(), ","));
        response.put("suggestions", splitStoredText(resumeDocument.getSuggestions(), "\\|\\|"));
        return response;
    }

    private Map<String, Object> readResumeData(String json) {
        try {
            return objectMapper.readValue(json, MAP_TYPE);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to read resume data", ex);
        }
    }

    private List<String> splitStoredText(String value, String delimiterRegex) {
        if (value == null || value.isBlank()) {
            return List.of();
        }

        return Arrays.stream(value.split(delimiterRegex))
                .map(String::trim)
                .filter(part -> !part.isBlank())
                .collect(Collectors.toList());
    }

    private Map<String, Object> normalizeResumeData(Map<String, Object> payload) {
        Map<String, Object> normalized = new LinkedHashMap<>();

        Map<String, Object> personalInfo = castMap(payload.get("personalInfo"));
        normalized.put("personalInfo", new LinkedHashMap<>(Map.of(
                "name", asString(personalInfo.get("name")),
                "email", asString(personalInfo.get("email")),
                "phone", asString(personalInfo.get("phone")),
                "location", asString(personalInfo.get("location")),
                "linkedin", asString(personalInfo.get("linkedin")),
                "portfolio", asString(personalInfo.get("portfolio"))
        )));

        normalized.put("professionalSummary", asString(payload.get("professionalSummary")));
        normalized.put("skills", sanitizeStringList(payload.get("skills")));
        normalized.put("education", sanitizeObjectList(payload.get("education"), List.of("institution", "degree", "duration", "description")));
        normalized.put("experience", sanitizeObjectList(payload.get("experience"), List.of("company", "role", "duration", "description")));
        normalized.put("projects", sanitizeObjectList(payload.get("projects"), List.of("name", "role", "duration", "description")));
        normalized.put("certifications", sanitizeObjectList(payload.get("certifications"), List.of("name", "issuer", "year", "description")));
        normalized.put("achievements", sanitizeStringList(payload.get("achievements")));
        normalized.put("keywords", sanitizeStringList(payload.get("keywords")));

        return normalized;
    }

    private Map<String, Object> calculateAtsScore(Map<String, Object> resumeData) {
        int sectionScore = 0;
        int keywordScore = 0;
        List<String> suggestions = new ArrayList<>();

        Map<String, Object> personalInfo = castMap(resumeData.get("personalInfo"));
        int completedSections = 0;

        for (String section : REQUIRED_SECTIONS) {
            if (isSectionComplete(section, resumeData, personalInfo)) {
                completedSections++;
            }
        }

        sectionScore = (int) Math.round((completedSections / (double) REQUIRED_SECTIONS.size()) * 60);

        List<String> keywords = sanitizeStringList(resumeData.get("keywords"));
        String searchableText = buildSearchableText(resumeData);
        List<String> missingKeywords = keywords.stream()
                .filter(keyword -> !searchableText.contains(keyword.toLowerCase(Locale.ROOT)))
                .collect(Collectors.toList());

        if (!keywords.isEmpty()) {
            keywordScore = (int) Math.round(((keywords.size() - missingKeywords.size()) / (double) keywords.size()) * 40);
        }

        if (!personalInfoComplete(personalInfo)) {
            suggestions.add("Fill in all personal info fields so recruiters and ATS systems can index your contact details.");
        }
        if (asString(resumeData.get("professionalSummary")).isBlank()) {
            suggestions.add("Add a concise professional summary with your strongest role, experience, and domain keywords.");
        }
        if (sanitizeStringList(resumeData.get("skills")).size() < 5) {
            suggestions.add("List at least 5 relevant skills to improve keyword coverage.");
        }
        if (sanitizeObjectList(resumeData.get("experience"), List.of("company", "role", "duration", "description")).isEmpty()) {
            suggestions.add("Add at least one experience entry with measurable impact in the description.");
        }
        if (missingKeywords.isEmpty()) {
            suggestions.add("Keyword coverage looks strong. Keep role-specific terms aligned with the target job description.");
        } else {
            suggestions.add("Include missing ATS keywords naturally in summary, skills, experience, or projects.");
        }

        int finalScore = Math.max(0, Math.min(100, sectionScore + keywordScore));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("score", finalScore);
        response.put("missingKeywords", missingKeywords);
        response.put("suggestions", suggestions.stream().distinct().collect(Collectors.toList()));
        return response;
    }

    private boolean isSectionComplete(String section, Map<String, Object> resumeData, Map<String, Object> personalInfo) {
        return switch (section) {
            case "personalInfo" -> personalInfoComplete(personalInfo);
            case "professionalSummary" -> !asString(resumeData.get("professionalSummary")).isBlank();
            case "skills" -> !sanitizeStringList(resumeData.get("skills")).isEmpty();
            case "education", "experience", "projects", "certifications" ->
                    !castList(resumeData.get(section)).isEmpty();
            case "achievements", "keywords" -> !sanitizeStringList(resumeData.get(section)).isEmpty();
            default -> false;
        };
    }

    private boolean personalInfoComplete(Map<String, Object> personalInfo) {
        return !asString(personalInfo.get("name")).isBlank()
                && !asString(personalInfo.get("email")).isBlank()
                && !asString(personalInfo.get("phone")).isBlank()
                && !asString(personalInfo.get("location")).isBlank();
    }

    private String buildSearchableText(Map<String, Object> resumeData) {
        StringBuilder builder = new StringBuilder();
        appendMapValues(builder, castMap(resumeData.get("personalInfo")));
        builder.append(" ").append(asString(resumeData.get("professionalSummary")));
        sanitizeStringList(resumeData.get("skills")).forEach(value -> builder.append(" ").append(value));
        sanitizeStringList(resumeData.get("achievements")).forEach(value -> builder.append(" ").append(value));

        for (String section : List.of("education", "experience", "projects", "certifications")) {
            for (Map<String, String> item : sanitizeObjectList(resumeData.get(section), List.of())) {
                item.values().forEach(value -> builder.append(" ").append(value));
            }
        }

        return builder.toString().toLowerCase(Locale.ROOT);
    }

    private void appendMapValues(StringBuilder builder, Map<String, Object> values) {
        values.values().forEach(value -> builder.append(" ").append(asString(value)));
    }

    private void generatePdf(Map<String, Object> resumeData, String title, String templateId, Path filePath) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                // FIX: Map old template IDs to new ATS-friendly versions
                String normalizedTemplateId = templateId;
                if ("two-column-executive".equals(templateId)) {
                    normalizedTemplateId = "executive"; // Migrated to single-column ATS-friendly version
                }
                
                switch (normalizedTemplateId) {
                    case "modern-minimal" -> renderModernMinimalPdf(contentStream, page, resumeData, title, normalizedTemplateId);
                    case "clean-structured" -> renderCleanStructuredPdf(contentStream, page, resumeData, title, normalizedTemplateId);
                    case "simple-elegant" -> renderSimpleElegantPdf(contentStream, page, resumeData, title, normalizedTemplateId);
                    case "executive" -> renderExecutivePdf(contentStream, page, resumeData, title, normalizedTemplateId);
                    default -> renderClassicProfessionalPdf(contentStream, page, resumeData, title, normalizedTemplateId);
                }
            }
            document.save(filePath.toFile());
        }
    }

    private void renderClassicProfessionalPdf(PDPageContentStream contentStream, PDPage page,
                                              Map<String, Object> resumeData, String title, String templateId) throws IOException {
        float margin = 48f;
        float y = page.getMediaBox().getHeight() - margin;
        float width = page.getMediaBox().getWidth() - (margin * 2);
        Map<String, Object> personalInfo = castMap(resumeData.get("personalInfo"));

        contentStream.setNonStrokingColor(15, 23, 42);
        y = writeText(contentStream, firstNonBlank(asString(personalInfo.get("name")), title), margin, y, 20, PDType1Font.HELVETICA_BOLD);
        String titleLine = firstNonBlank(asString(personalInfo.get("title")), "");
        if (!titleLine.isBlank()) {
            y = writeText(contentStream, titleLine, margin, y - 4, 11, PDType1Font.HELVETICA_OBLIQUE);
        }
        y = writeWrappedText(contentStream, trimForPdf(buildContactLine(personalInfo, " | ")), margin, y - 6, width, 10, 14, PDType1Font.HELVETICA);
        drawRule(contentStream, margin, y - 2, width, 15, 23, 42);
        y -= 16;
        writeStandardSections(contentStream, resumeData, margin, y, width, 37, 99, 235);
        writeFooter(contentStream, margin, templateId);
    }

    private void renderModernMinimalPdf(PDPageContentStream contentStream, PDPage page,
                                        Map<String, Object> resumeData, String title, String templateId) throws IOException {
        float margin = 52f;
        float y = page.getMediaBox().getHeight() - margin;
        float width = page.getMediaBox().getWidth() - (margin * 2);
        Map<String, Object> personalInfo = castMap(resumeData.get("personalInfo"));

        contentStream.setNonStrokingColor(17, 24, 39);
        y = writeText(contentStream, firstNonBlank(asString(personalInfo.get("name")), title), margin, y, 24, PDType1Font.HELVETICA_BOLD);
        String titleLine = firstNonBlank(asString(personalInfo.get("title")), "");
        if (!titleLine.isBlank()) {
            y = writeText(contentStream, titleLine, margin, y - 2, 11, PDType1Font.HELVETICA);
        }
        y = writeWrappedText(contentStream, trimForPdf(buildContactLine(personalInfo, "   ")), margin, y - 8, width, 9.5f, 13f, PDType1Font.HELVETICA);
        drawRule(contentStream, margin, y - 2, 4f, 17, 24, 39, 60f);
        y = writeWrappedText(contentStream, trimForPdf(asString(resumeData.get("professionalSummary"))), margin + 16, y - 18, width - 16, 10, 14, PDType1Font.HELVETICA);
        y -= 10;
        writeStandardSections(contentStream, resumeData, margin, y, width, 17, 24, 39, false, false);
        writeFooter(contentStream, margin, templateId);
    }

    private void renderCleanStructuredPdf(PDPageContentStream contentStream, PDPage page,
                                          Map<String, Object> resumeData, String title, String templateId) throws IOException {
        float margin = 42f;
        float pageWidth = page.getMediaBox().getWidth();
        float y = page.getMediaBox().getHeight() - 38f;
        float width = pageWidth - (margin * 2);
        Map<String, Object> personalInfo = castMap(resumeData.get("personalInfo"));

        contentStream.setNonStrokingColor(29, 78, 216);
        contentStream.addRect(0, page.getMediaBox().getHeight() - 118, pageWidth, 118);
        contentStream.fill();

        contentStream.setNonStrokingColor(255, 255, 255);
        y = writeText(contentStream, firstNonBlank(asString(personalInfo.get("name")), title), margin, y, 22, PDType1Font.HELVETICA_BOLD);
        String titleLine = firstNonBlank(asString(personalInfo.get("title")), "");
        if (!titleLine.isBlank()) {
            y = writeText(contentStream, titleLine, margin, y - 4, 11, PDType1Font.HELVETICA);
        }
        y = writeWrappedText(contentStream, trimForPdf(buildContactLine(personalInfo, " | ")), margin, y - 10, width, 9.5f, 13f, PDType1Font.HELVETICA);
        y = page.getMediaBox().getHeight() - 142f;
        writeStandardSections(contentStream, resumeData, margin, y, width, 29, 78, 216);
        writeFooter(contentStream, margin, templateId);
    }

    private void renderSimpleElegantPdf(PDPageContentStream contentStream, PDPage page,
                                        Map<String, Object> resumeData, String title, String templateId) throws IOException {
        float margin = 56f;
        float y = page.getMediaBox().getHeight() - margin;
        float width = page.getMediaBox().getWidth() - (margin * 2);
        float centerX = page.getMediaBox().getWidth() / 2f;
        Map<String, Object> personalInfo = castMap(resumeData.get("personalInfo"));

        String name = firstNonBlank(asString(personalInfo.get("name")), title).toUpperCase(Locale.ROOT);
        y = writeCenteredText(contentStream, name, centerX, y, 20, PDType1Font.HELVETICA_BOLD);
        String titleLine = firstNonBlank(asString(personalInfo.get("title")), "");
        if (!titleLine.isBlank()) {
            y = writeCenteredText(contentStream, titleLine, centerX, y - 4, 11, PDType1Font.HELVETICA);
        }
        drawRule(contentStream, margin + 40, y - 4, width - 80, 148, 163, 184);
        y = writeCenteredWrappedText(contentStream, trimForPdf(buildContactLine(personalInfo, " | ")), centerX, y - 16, width, 9.5f, 13f, PDType1Font.HELVETICA);
        drawRule(contentStream, margin + 40, y - 4, width - 80, 148, 163, 184);
        y = writeCenteredWrappedText(contentStream, trimForPdf(asString(resumeData.get("professionalSummary"))), centerX, y - 20, width - 40, 10, 14, PDType1Font.HELVETICA_OBLIQUE);
        y -= 12;
        writeStandardSections(contentStream, resumeData, margin, y, width, 100, 116, 139, false, false);
        writeFooter(contentStream, margin, templateId);
    }

    // FIX: Single-column ATS-friendly executive layout
    // Two-column layouts can confuse ATS systems that read sequentially
    private void renderExecutivePdf(PDPageContentStream contentStream, PDPage page,
                                    Map<String, Object> resumeData, String title, String templateId) throws IOException {
        float margin = 48f;
        float y = page.getMediaBox().getHeight() - margin;
        float width = page.getMediaBox().getWidth() - (margin * 2);
        Map<String, Object> personalInfo = castMap(resumeData.get("personalInfo"));

        // Header with professional styling
        contentStream.setNonStrokingColor(15, 23, 42);
        y = writeText(contentStream, firstNonBlank(asString(personalInfo.get("name")), title), margin, y, 22, PDType1Font.HELVETICA_BOLD);
        String titleLine = firstNonBlank(asString(personalInfo.get("title")), "");
        if (!titleLine.isBlank()) {
            y = writeText(contentStream, titleLine, margin, y - 4, 12, PDType1Font.HELVETICA);
        }
        y = writeWrappedText(contentStream, trimForPdf(buildContactLine(personalInfo, " | ")), margin, y - 8, width, 10, 14, PDType1Font.HELVETICA);
        
        // Draw header underline
        y -= 12;
        contentStream.setStrokingColor(76, 29, 149);
        contentStream.setLineWidth(2f);
        contentStream.moveTo(margin, y);
        contentStream.lineTo(page.getMediaBox().getWidth() - margin, y);
        contentStream.stroke();
        y -= 8;

        // Professional Summary
        y = writeSection(contentStream, "Professional Summary", List.of(asString(resumeData.get("professionalSummary"))), margin, y, width, 76, 29, 149);
        
        // Core Competencies (Skills)
        List<String> skills = sanitizeStringList(resumeData.get("skills"));
        if (!skills.isEmpty()) {
            y = writeSection(contentStream, "Core Competencies", List.of(String.join(" • ", skills)), margin, y, width, 76, 29, 149);
        }
        
        // Professional Experience
        y = writeObjectSection(contentStream, "Professional Experience", 
            sanitizeObjectList(resumeData.get("experience"), List.of("company", "role", "duration", "description")), 
            margin, y, width, 76, 29, 149);
        
        // Education
        y = writeObjectSection(contentStream, "Education", 
            sanitizeObjectList(resumeData.get("education"), List.of("institution", "degree", "duration", "description")), 
            margin, y, width, 76, 29, 149);
        
        // Projects
        y = writeObjectSection(contentStream, "Projects", 
            sanitizeObjectList(resumeData.get("projects"), List.of("name", "role", "duration", "description")), 
            margin, y, width, 76, 29, 149);
        
        // Certifications
        y = writeObjectSection(contentStream, "Certifications", 
            sanitizeObjectList(resumeData.get("certifications"), List.of("name", "issuer", "year", "description")), 
            margin, y, width, 76, 29, 149);
        
        // Achievements
        y = writeSection(contentStream, "Achievements", sanitizeStringList(resumeData.get("achievements")), margin, y, width, 76, 29, 149);
        
        // ATS Keywords (for parser optimization)
        List<String> keywords = sanitizeStringList(resumeData.get("keywords"));
        if (!keywords.isEmpty()) {
            y = writeSection(contentStream, "ATS Keywords", List.of(String.join(", ", keywords)), margin, y, width, 76, 29, 149);
        }
        
        writeFooter(contentStream, margin, templateId);
    }

    private float writeStandardSections(PDPageContentStream contentStream, Map<String, Object> resumeData,
                                        float margin, float y, float width, int r, int g, int b) throws IOException {
        return writeStandardSections(contentStream, resumeData, margin, y, width, r, g, b, true, false);
    }

    private float writeStandardSections(PDPageContentStream contentStream, Map<String, Object> resumeData,
                                        float margin, float y, float width, int r, int g, int b,
                                        boolean includeSummary, boolean skipEducationAndSkills) throws IOException {
        if (includeSummary) {
            y = writeSection(contentStream, "Professional Summary", List.of(asString(resumeData.get("professionalSummary"))), margin, y, width, r, g, b);
        }
        if (!skipEducationAndSkills) {
            y = writeSection(contentStream, "Skills", List.of(String.join(", ", sanitizeStringList(resumeData.get("skills")))), margin, y, width, r, g, b);
        }
        y = writeObjectSection(contentStream, "Experience", sanitizeObjectList(resumeData.get("experience"), List.of("company", "role", "duration", "description")), margin, y, width, r, g, b);
        if (!skipEducationAndSkills) {
            y = writeObjectSection(contentStream, "Education", sanitizeObjectList(resumeData.get("education"), List.of("institution", "degree", "duration", "description")), margin, y, width, r, g, b);
        }
        y = writeObjectSection(contentStream, "Projects", sanitizeObjectList(resumeData.get("projects"), List.of("name", "role", "duration", "description")), margin, y, width, r, g, b);
        y = writeObjectSection(contentStream, "Certifications", sanitizeObjectList(resumeData.get("certifications"), List.of("name", "issuer", "year", "description")), margin, y, width, r, g, b);
        y = writeSection(contentStream, "Achievements", sanitizeStringList(resumeData.get("achievements")), margin, y, width, r, g, b);
        return writeSection(contentStream, "ATS Keywords", List.of(String.join(", ", sanitizeStringList(resumeData.get("keywords")))), margin, y, width, r, g, b);
    }

    private float writeSection(PDPageContentStream contentStream, String heading, List<String> lines,
                               float margin, float y, float width) throws IOException {
        return writeSection(contentStream, heading, lines, margin, y, width, 37, 99, 235);
    }

    private float writeSection(PDPageContentStream contentStream, String heading, List<String> lines,
                               float margin, float y, float width, int r, int g, int b) throws IOException {
        List<String> filteredLines = lines.stream()
                .map(this::asString)
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .collect(Collectors.toList());

        if (filteredLines.isEmpty()) {
            return y;
        }

        contentStream.setNonStrokingColor(r, g, b);
        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.newLineAtOffset(margin, y);
        contentStream.showText(trimForPdf(heading));
        contentStream.endText();
        y -= 16;

        contentStream.setNonStrokingColor(15, 23, 42);
        for (String line : filteredLines) {
            y = writeWrappedText(contentStream, trimForPdf(line), margin, y, width, 10, 14, PDType1Font.HELVETICA);
        }

        return y - 10;
    }

    private float writeObjectSection(PDPageContentStream contentStream, String heading, List<Map<String, String>> items,
                                     float margin, float y, float width) throws IOException {
        return writeObjectSection(contentStream, heading, items, margin, y, width, 37, 99, 235);
    }

    private float writeObjectSection(PDPageContentStream contentStream, String heading, List<Map<String, String>> items,
                                     float margin, float y, float width, int r, int g, int b) throws IOException {
        if (items.isEmpty()) {
            return y;
        }

        contentStream.setNonStrokingColor(r, g, b);
        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.newLineAtOffset(margin, y);
        contentStream.showText(trimForPdf(heading));
        contentStream.endText();
        y -= 16;

        contentStream.setNonStrokingColor(15, 23, 42);
        for (Map<String, String> item : items) {
            String headline = item.values().stream()
                    .filter(value -> value != null && !value.isBlank())
                    .limit(3)
                    .collect(Collectors.joining(" | "));

            if (!headline.isBlank()) {
                y = writeWrappedText(contentStream, trimForPdf(headline), margin, y, width, 10, 14, PDType1Font.HELVETICA_BOLD);
            }

            String description = firstNonBlank(item.get("description"), "");
            if (!description.isBlank()) {
                y = writeWrappedText(contentStream, trimForPdf(description), margin + 10, y, width - 10, 10, 14, PDType1Font.HELVETICA);
            }

            y -= 6;
        }

        return y - 8;
    }

    private float writeText(PDPageContentStream contentStream, String text, float x, float y,
                            float fontSize, PDType1Font font) throws IOException {
        if (text == null || text.isBlank()) {
            return y;
        }
        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        contentStream.newLineAtOffset(x, y);
        contentStream.showText(trimForPdf(text));
        contentStream.endText();
        return y - (fontSize + 4);
    }

    private float writeCenteredText(PDPageContentStream contentStream, String text, float centerX, float y,
                                    float fontSize, PDType1Font font) throws IOException {
        if (text == null || text.isBlank()) {
            return y;
        }
        float textWidth = font.getStringWidth(trimForPdf(text)) / 1000 * fontSize;
        return writeText(contentStream, text, centerX - (textWidth / 2f), y, fontSize, font);
    }

    private float writeCenteredWrappedText(PDPageContentStream contentStream, String text, float centerX, float y,
                                           float width, float fontSize, float leading, PDType1Font font) throws IOException {
        List<String> lines = wrapText(text, width, font, fontSize);
        for (String line : lines) {
            float textWidth = font.getStringWidth(trimForPdf(line)) / 1000 * fontSize;
            y = writeText(contentStream, line, centerX - (textWidth / 2f), y, fontSize, font);
            y += 4 - leading + fontSize;
        }
        return y - 4;
    }

    private void drawRule(PDPageContentStream contentStream, float x, float y, float width,
                          int r, int g, int b) throws IOException {
        drawRule(contentStream, x, y, width, r, g, b, 1f);
    }

    private void drawRule(PDPageContentStream contentStream, float x, float y, float width,
                          int r, int g, int b, float lineWidth) throws IOException {
        contentStream.setStrokingColor(r, g, b);
        contentStream.setLineWidth(lineWidth);
        contentStream.moveTo(x, y);
        contentStream.lineTo(x + width, y);
        contentStream.stroke();
    }

    private String buildContactLine(Map<String, Object> personalInfo, String separator) {
        return String.join(separator, sanitizeStringList(List.of(
                asString(personalInfo.get("email")),
                asString(personalInfo.get("phone")),
                asString(personalInfo.get("location")),
                asString(personalInfo.get("linkedin")),
                asString(personalInfo.get("portfolio")),
                asString(personalInfo.get("title"))
        )));
    }

    private void writeFooter(PDPageContentStream contentStream, float x, String templateId) throws IOException {
        contentStream.setNonStrokingColor(100, 116, 139);
        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA_OBLIQUE, 8);
        contentStream.newLineAtOffset(x, 24);
        contentStream.showText(trimForPdf("Generated with template: " + templateId));
        contentStream.endText();
    }

    private float writeWrappedText(PDPageContentStream contentStream, String text, float x, float y, float width,
                                   float fontSize, float leading, PDType1Font font) throws IOException {
        if (text == null || text.isBlank()) {
            return y;
        }

        List<String> lines = wrapText(text, width, font, fontSize);
        for (String line : lines) {
            contentStream.beginText();
            contentStream.setFont(font, fontSize);
            contentStream.newLineAtOffset(x, y);
            contentStream.showText(trimForPdf(line));
            contentStream.endText();
            y -= leading;
        }
        return y;
    }

    private List<String> wrapText(String text, float width, PDType1Font font, float fontSize) throws IOException {
        List<String> lines = new ArrayList<>();
        String[] words = text.split("\\s+");
        StringBuilder currentLine = new StringBuilder();

        for (String word : words) {
            String tentative = currentLine.isEmpty() ? word : currentLine + " " + word;
            float textWidth = font.getStringWidth(tentative) / 1000 * fontSize;
            if (textWidth > width && !currentLine.isEmpty()) {
                lines.add(currentLine.toString());
                currentLine = new StringBuilder(word);
            } else {
                currentLine = new StringBuilder(tentative);
            }
        }

        if (!currentLine.isEmpty()) {
            lines.add(currentLine.toString());
        }

        return lines;
    }

    private String buildDefaultTitle(Map<String, Object> resumeData) {
        Map<String, Object> personalInfo = castMap(resumeData.get("personalInfo"));
        String name = asString(personalInfo.get("name"));
        return name.isBlank() ? "Resume Draft" : name + " Resume";
    }

    private String buildPdfName(String title) {
        String slug = title.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (slug.isBlank()) {
            slug = "resume";
        }
        return slug + "-" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now()) + ".pdf";
    }

    private void deleteGeneratedFile(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return;
        }
        try {
            Files.deleteIfExists(resumeDir.resolve(fileName).normalize());
        } catch (IOException ignored) {
        }
    }

    private Map<String, Object> castMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            Map<String, Object> response = new LinkedHashMap<>();
            map.forEach((key, itemValue) -> response.put(String.valueOf(key), itemValue));
            return response;
        }
        return new LinkedHashMap<>();
    }

    private List<Object> castList(Object value) {
        if (value instanceof List<?> list) {
            return new ArrayList<>(list);
        }
        return new ArrayList<>();
    }

    private List<Map<String, String>> sanitizeObjectList(Object value, List<String> preferredKeys) {
        List<Map<String, String>> sanitized = new ArrayList<>();
        for (Object item : castList(value)) {
            if (!(item instanceof Map<?, ?> map)) {
                continue;
            }
            Map<String, String> normalized = new LinkedHashMap<>();
            if (preferredKeys.isEmpty()) {
                map.forEach((key, itemValue) -> normalized.put(String.valueOf(key), asString(itemValue)));
            } else {
                for (String key : preferredKeys) {
                    normalized.put(key, asString(map.get(key)));
                }
            }

            boolean hasContent = normalized.values().stream().anyMatch(part -> part != null && !part.isBlank());
            if (hasContent) {
                sanitized.add(normalized);
            }
        }
        return sanitized;
    }

    private List<String> sanitizeStringList(Object value) {
        if (value instanceof List<?> list) {
            return list.stream()
                    .map(this::asString)
                    .map(String::trim)
                    .filter(item -> !item.isBlank())
                    .distinct()
                    .collect(Collectors.toList());
        }
        if (value instanceof String text) {
            return Arrays.stream(text.split(","))
                    .map(String::trim)
                    .filter(item -> !item.isBlank())
                    .distinct()
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    private String asString(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private List<String> castStringList(Object value) {
        if (value instanceof List<?> list) {
            return list.stream().map(this::asString).filter(item -> !item.isBlank()).collect(Collectors.toList());
        }
        return List.of();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }

    private String trimForPdf(String value) {
        return value == null ? "" : value.replaceAll("[\\r\\n]+", " ").trim();
    }
}
