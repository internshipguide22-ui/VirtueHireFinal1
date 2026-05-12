package com.virtuehire.service;

import com.virtuehire.model.*;
import com.virtuehire.repository.*;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final QuestionRepository      repo;
    private final AssessmentConfigRepository configRepo;
    private final AssessmentQuestionRepository assessmentQuestionRepo;
    private final CodingDetailRepository  codingDetailRepo;
    private final TestCaseRepository      testCaseRepo;

    public QuestionService(QuestionRepository repo,
                           AssessmentConfigRepository configRepo,
                           AssessmentQuestionRepository assessmentQuestionRepo,
                           CodingDetailRepository codingDetailRepo,
                           TestCaseRepository testCaseRepo) {
        this.repo            = repo;
        this.configRepo      = configRepo;
        this.assessmentQuestionRepo = assessmentQuestionRepo;
        this.codingDetailRepo = codingDetailRepo;
        this.testCaseRepo    = testCaseRepo;
    }

    // ───────────────────────────────────────────────────────────
    // BASIC CRUD
    // ───────────────────────────────────────────────────────────

    public List<Question> getAllQuestionsFromRepository() {
        return repo.findAll();
    }

    public Question getQuestionByIdFromRepository(Long id) {
        return repo.findById(id).orElse(null);
    }

    public void saveQuestionViaRepository(Question q) {
        repo.save(q);
    }

    public void deleteQuestionViaRepository(Long id) {
        repo.deleteById(id);
    }

    // ───────────────────────────────────────────────────────────
    // CSV / PDF UPLOAD ENTRY POINTS
    // ───────────────────────────────────────────────────────────

    public void saveQuestionsFromCSV(MultipartFile file, String testName) throws Exception {
        saveQuestionsFromUpload(file, testName, null, null, null, null);
    }

    public void saveQuestionsFromUpload(MultipartFile file, String testName,
                                        String input1, String output1,
                                        String input2, String output2) throws Exception {
        saveQuestionsFromUpload(file, testName, input1, output1, input2, output2, "ADMIN", null);
    }

    public void saveQuestionsFromUpload(MultipartFile file, String testName,
                                        String input1, String output1,
                                        String input2, String output2,
                                        String createdByRole, Long createdByHrId) throws Exception {
        if (file.isEmpty()) {
            throw new RuntimeException("CSV file is empty.");
        }

        String originalFilename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);

        if (originalFilename.endsWith(".pdf") || contentType.contains("pdf")) {
            // ✅ FIX: Route to the single, authoritative PDF handler
            saveQuestionFromPdf(file, testName, input1, output1, input2, output2, createdByRole, createdByHrId);
            return;
        }

        try (java.io.Reader reader = new java.io.InputStreamReader(
                new org.apache.commons.io.input.BOMInputStream(file.getInputStream()));
             CSVParser csvParser = new CSVParser(reader,
                     CSVFormat.Builder.create()
                             .setHeader()
                             .setSkipHeaderRecord(true)
                             .setIgnoreHeaderCase(true)
                             .setTrim(true)
                             .build())) {

            Map<String, Integer> headers = csvParser.getHeaderMap();
            Set<String> normalizedHeaders = headers == null ? Set.of()
                    : headers.keySet().stream()
                              .map(h -> h.trim().toLowerCase().replace(" ", ""))
                              .collect(Collectors.toSet());

            boolean isMixedFormat = normalizedHeaders.contains("hascompiler")
                    || normalizedHeaders.contains("hascompi");

            if (isMixedFormat) {
                processMixedCsv(csvParser, testName, createdByRole, createdByHrId);
            } else {
                processLegacyCsv(csvParser, testName, normalizedHeaders, headers, createdByRole, createdByHrId);
            }
        }
    }

    // ───────────────────────────────────────────────────────────
    // PDF HANDLER — single authoritative method
    // ✅ FIX: Sets hasCompiler=true AND type="CODING", saves test cases
    // ───────────────────────────────────────────────────────────

    private void saveQuestionFromPdf(MultipartFile file, String testName,
                                     String input1, String output1,
                                     String input2, String output2,
                                     String createdByRole, Long createdByHrId) throws Exception {
        String subject = testName == null ? "" : testName.trim();
        List<String> missing = new ArrayList<>();

        if (subject.isBlank())                         missing.add("testName");
        if (input1 == null || input1.trim().isBlank()) missing.add("input1");
        if (output1 == null || output1.trim().isBlank()) missing.add("output1");
        if (input2 == null || input2.trim().isBlank()) missing.add("input2");
        if (output2 == null || output2.trim().isBlank()) missing.add("output2");

        if (!missing.isEmpty()) {
            throw new IllegalArgumentException(
                    "PDF upload requires: " + String.join(", ", missing));
        }

        String description;
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            description = new PDFTextStripper().getText(document).trim();
        }

        if (description.isBlank()) {
            throw new IllegalArgumentException("The uploaded PDF does not contain readable text.");
        }

        // ✅ FIX: Use the same constructor as saveCodingRow — sets hasCompiler=true AND type="CODING"
        Question question = new Question(subject, subject, true, "CODING");
        applyOwnership(question, createdByRole, createdByHrId);
        question = repo.save(question);

        CodingDetail detail = new CodingDetail();
        detail.setQuestion(question);
        detail.setDescription(description);
        codingDetailRepo.save(detail);

        // ✅ FIX: Test cases are always saved (was missing in the old saveCodingFromPDF)
        saveTestCase(question, input1.trim(), output1.trim());
        saveTestCase(question, input2.trim(), output2.trim());
    }

    // ───────────────────────────────────────────────────────────
    // MIXED CSV (MCQ + CODING rows)
    // ───────────────────────────────────────────────────────────

    private void processMixedCsv(CSVParser csvParser, String testName,
                                 String createdByRole, Long createdByHrId) {
        List<Question> mcqToSave = new ArrayList<>();
        int rowNum = 1;

        for (CSVRecord record : csvParser) {
            rowNum++;
            String type = safeGet(record, "type").toUpperCase();
            String hasCompilerStr = safeGet(record, "hascompiler", "hascompi");
            boolean hasCompiler = Boolean.parseBoolean(hasCompilerStr);

            if (hasCompiler || "CODING".equals(type)) {
                saveCodingRow(record, testName, rowNum, createdByRole, createdByHrId);
            } else {
                Question q = buildMcqFromMixedRow(record, testName, rowNum, createdByRole, createdByHrId);
                if (q != null && !repo.existsByTextAndSubject(q.getText(), q.getSubject())) {
                    mcqToSave.add(q);
                }
            }
        }

        if (!mcqToSave.isEmpty()) {
            repo.saveAll(mcqToSave);
        }
    }

    private void saveCodingRow(CSVRecord record, String testName, int rowNum,
                               String createdByRole, Long createdByHrId) {
        String description = safeGet(record, "description");
        String input1      = safeGet(record, "input1");
        String output1     = safeGet(record, "output1");
        String input2      = safeGet(record, "input2");
        String output2     = safeGet(record, "output2");
        String subject     = safeGet(record, "subject");
        if (subject.isBlank()) subject = testName != null ? testName.trim() : "";

        List<String> missing = new ArrayList<>();
        if (description.isBlank()) missing.add("description");
        if (input1.isBlank())      missing.add("input1");
        if (output1.isBlank())     missing.add("output1");
        if (input2.isBlank())      missing.add("input2");
        if (output2.isBlank())     missing.add("output2");
        if (subject.isBlank())     missing.add("subject/testName");

        String opt1 = safeGet(record, "option1");
        String opt2 = safeGet(record, "option2");
        if (!opt1.isBlank() || !opt2.isBlank()) {
            throw new IllegalArgumentException(
                    "Row " + rowNum + ": CODING rows must NOT have options filled.");
        }

        if (!missing.isEmpty()) {
            throw new IllegalArgumentException(
                    "Row " + rowNum + " (CODING): missing " + String.join(", ", missing));
        }

        Question q = new Question(subject, subject, true, "CODING");
        applyOwnership(q, createdByRole, createdByHrId);
        q = repo.save(q);

        CodingDetail detail = new CodingDetail();
        detail.setQuestion(q);
        detail.setDescription(description);
        codingDetailRepo.save(detail);

        saveTestCase(q, input1, output1);
        saveTestCase(q, input2, output2);
    }

    private void saveTestCase(Question q, String input, String expectedOutput) {
        TestCase tc = new TestCase();
        tc.setQuestion(q);
        tc.setInput(input);
        tc.setExpectedOutput(expectedOutput);
        testCaseRepo.save(tc);
    }

    private Question buildMcqFromMixedRow(CSVRecord record, String testName, int rowNum,
                                          String createdByRole, Long createdByHrId) {
        String subject = safeGet(record, "subject");
        if (subject.isBlank()) subject = testName != null ? testName.trim() : "";
        String text          = safeGet(record, "question");
        String opt1          = safeGet(record, "option1");
        String opt2          = safeGet(record, "option2");
        String opt3          = safeGet(record, "option3");
        String opt4          = safeGet(record, "option4");
        String correctAnswer = safeGet(record, "correctanswers", "correctanswer", "correctan");

        boolean blank = subject.isBlank() && text.isBlank() && opt1.isBlank();
        if (blank) return null;

        List<String> options = Arrays.asList(opt1, opt2, opt3, opt4);
        Question question = new Question(1, text, options, correctAnswer, subject, subject);
        applyOwnership(question, createdByRole, createdByHrId);
        return question;
    }

    private String safeGet(CSVRecord record, String... keys) {
        for (String key : keys) {
            try {
                if (record.isMapped(key)) {
                    String value = record.get(key);
                    if (value != null) {
                        return value.trim();
                    }
                }
            } catch (Exception ignored) {
                // Try next alias
            }
        }
        return "";
    }

    // ───────────────────────────────────────────────────────────
    // LEGACY MCQ-ONLY CSV
    // ───────────────────────────────────────────────────────────

    private void processLegacyCsv(CSVParser csvParser, String testName,
                                   Set<String> normalizedHeaders,
                                   Map<String, Integer> rawHeaders,
                                   String createdByRole, Long createdByHrId) {
        Map<String, String> headerAliases = resolveHeaderAliases(
                rawHeaders == null ? Set.of() : rawHeaders.keySet(), testName);

        List<Question> questions = new ArrayList<>();
        for (CSVRecord record : csvParser) {
            Question q = buildQuestionFromRecord(record, testName, headerAliases, createdByRole, createdByHrId);
            if (q == null) continue;
            if (!repo.existsByTextAndSubject(q.getText(), q.getSubject())) {
                questions.add(q);
            }
        }

        if (questions.isEmpty()) {
            throw new IllegalArgumentException(
                    "No valid questions were found. Use either " +
                    "subject,text,option1,option2,option3,option4,correctAnswer or " +
                    "question,option_a,option_b,option_c,option_d,correct_answer.");
        }
        repo.saveAll(questions);
    }

    private Map<String, String> resolveHeaderAliases(Set<String> rawHeaders, String testName) {
        Map<String, String> normalizedToActual = new HashMap<>();
        for (String rawHeader : rawHeaders) {
            if (rawHeader != null && !rawHeader.trim().isBlank()) {
                normalizedToActual.put(normalizeHeader(rawHeader), rawHeader);
            }
        }

        List<String> subjectFormatMissing = findMissingHeaders(normalizedToActual,
                List.of("subject", "text", "option1", "option2", "option3", "option4", "correctanswer"));

        List<String> legacyFormatMissing = findMissingHeaders(normalizedToActual,
                List.of("question", "option_a", "option_b", "option_c", "option_d", "correct_answer"));

        boolean subjectFormatSupported = subjectFormatMissing.isEmpty();
        boolean legacyFormatSupported  = legacyFormatMissing.isEmpty();

        if (!subjectFormatSupported && !legacyFormatSupported) {
            throw new IllegalArgumentException(
                    "Invalid CSV headers. Missing columns for subject format: " + joinColumns(subjectFormatMissing)
                            + ". Missing columns for question format: " + joinColumns(legacyFormatMissing) + ".");
        }

        if (subjectFormatSupported) {
            return Map.of(
                    "subject",       normalizedToActual.get("subject"),
                    "text",          normalizedToActual.get("text"),
                    "option1",       normalizedToActual.get("option1"),
                    "option2",       normalizedToActual.get("option2"),
                    "option3",       normalizedToActual.get("option3"),
                    "option4",       normalizedToActual.get("option4"),
                    "correctAnswer", normalizedToActual.get("correctanswer"));
        }

        if (testName == null || testName.trim().isBlank()) {
            throw new IllegalArgumentException(
                    "The question format requires a test name because it does not include a subject column.");
        }

        return Map.of(
                "question",       normalizedToActual.get("question"),
                "option_a",       normalizedToActual.get("option_a"),
                "option_b",       normalizedToActual.get("option_b"),
                "option_c",       normalizedToActual.get("option_c"),
                "option_d",       normalizedToActual.get("option_d"),
                "correct_answer", normalizedToActual.get("correct_answer"));
    }

    private Question buildQuestionFromRecord(CSVRecord record, String testName,
                                             Map<String, String> headerAliases,
                                             String createdByRole, Long createdByHrId) {
        boolean subjectFormat = headerAliases.containsKey("subject");

        String subject      = subjectFormat ? value(record, headerAliases.get("subject")) : testName.trim();
        String sectionName  = subject;
        String text         = subjectFormat ? value(record, headerAliases.get("text"))
                                           : value(record, headerAliases.get("question"));
        List<String> optionsList = subjectFormat
                ? Arrays.asList(
                        value(record, headerAliases.get("option1")),
                        value(record, headerAliases.get("option2")),
                        value(record, headerAliases.get("option3")),
                        value(record, headerAliases.get("option4")))
                : Arrays.asList(
                        value(record, headerAliases.get("option_a")),
                        value(record, headerAliases.get("option_b")),
                        value(record, headerAliases.get("option_c")),
                        value(record, headerAliases.get("option_d")));
        String correctAnswer = subjectFormat
                ? value(record, headerAliases.get("correctAnswer"))
                : value(record, headerAliases.get("correct_answer"));

        boolean blankRow = subject.isBlank() && sectionName.isBlank() && text.isBlank()
                && correctAnswer.isBlank() && optionsList.stream().allMatch(String::isBlank);
        if (blankRow) return null;

        List<String> missingFields = new ArrayList<>();
        if (subject.isBlank())            missingFields.add("subject");
        if (text.isBlank())               missingFields.add(subjectFormat ? "text" : "question");
        if (optionsList.get(0).isBlank()) missingFields.add(subjectFormat ? "option1" : "option_a");
        if (optionsList.get(1).isBlank()) missingFields.add(subjectFormat ? "option2" : "option_b");
        if (optionsList.get(2).isBlank()) missingFields.add(subjectFormat ? "option3" : "option_c");
        if (optionsList.get(3).isBlank()) missingFields.add(subjectFormat ? "option4" : "option_d");
        if (correctAnswer.isBlank())      missingFields.add(subjectFormat ? "correctAnswer" : "correct_answer");

        if (!missingFields.isEmpty()) {
            throw new IllegalArgumentException("Row " + record.getRecordNumber()
                    + " is missing required value(s): " + String.join(", ", missingFields) + ".");
        }

        boolean answerMatchesOption = optionsList.stream()
                .anyMatch(option -> option.equalsIgnoreCase(correctAnswer));
        if (!answerMatchesOption) {
            throw new IllegalArgumentException("Row " + record.getRecordNumber()
                    + " has an invalid correct answer. The correct answer must exactly match one of the provided options.");
        }

        Question question = new Question(1, text, optionsList, correctAnswer, subject, sectionName);
        applyOwnership(question, createdByRole, createdByHrId);
        return question;
    }

    private List<String> findMissingHeaders(Map<String, String> normalizedToActual,
                                            List<String> requiredHeaders) {
        return requiredHeaders.stream()
                .filter(header -> !normalizedToActual.containsKey(header))
                .collect(Collectors.toList());
    }

    private String joinColumns(List<String> columns) {
        return columns.isEmpty() ? "none" : String.join(", ", new LinkedHashSet<>(columns));
    }

    private String normalizeHeader(String header) {
        return header == null ? "" : header.trim().toLowerCase().replace(" ", "");
    }

    private String value(CSVRecord record, String actualHeader) {
        if (actualHeader == null || !record.isMapped(actualHeader)) return "";
        return record.get(actualHeader).trim();
    }

    // ───────────────────────────────────────────────────────────
    // CONFIG MANAGEMENT
    // ───────────────────────────────────────────────────────────

    public List<AssessmentConfig> getConfigs(String subject) {
        return configRepo.findBySubjectOrderBySectionNumberAsc(subject);
    }

    public void saveConfigs(List<AssessmentConfig> configs) {
        configRepo.saveAll(configs);
    }

    public void deleteAssessmentBySubject(String subject) {
        String normalized = normalizeSubject(subject);
        if (normalized != null) {
            List<Question> questions = repo.findBySubject(normalized);
            repo.deleteAll(questions);
            List<AssessmentConfig> configs = configRepo.findBySubjectOrderBySectionNumberAsc(normalized);
            configRepo.deleteAll(configs);
        }
    }

    // ───────────────────────────────────────────────────────────
    // CUSTOM QUERIES
    // ───────────────────────────────────────────────────────────

    public List<String> getAllSubjects() {
        return repo.findAll().stream()
                .map(Question::getSubject)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<String> getAllSubjectsForHr(Long hrId) {
        return repo.findAll().stream()
                .filter(question -> canHrOwnQuestion(question, hrId))
                .map(Question::getSubject)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<String> getConfiguredSubjects() {
        return configRepo.findDistinctSubject();
    }

    public List<Question> getQuestionsBySubject(String subject) {
        return repo.findBySubject(subject);
    }

    public List<Question> getQuestionsBySubjectForHr(String subject, Long hrId) {
        return repo.findBySubject(subject).stream()
                .filter(question -> canHrOwnQuestion(question, hrId))
                .collect(Collectors.toList());
    }

    public List<Question> getQuestionsBySubjectAndLevel(String subject, int level) {
        return repo.findBySubjectAndLevel(normalizeSubject(subject), level);
    }

    public String normalizeSubject(String subject) {
        if (subject == null) return null;
        List<String> validSubjects = getAllSubjects();
        for (String s : validSubjects) {
            if (s.equalsIgnoreCase(subject)) return s;
        }
        return subject;
    }

    public String normalizeSubjectForHr(String subject, Long hrId) {
        if (subject == null) return null;
        List<String> validSubjects = getAllSubjectsForHr(hrId);
        for (String s : validSubjects) {
            if (s.equalsIgnoreCase(subject)) return s;
        }
        return subject;
    }

    // ───────────────────────────────────────────────────────────
    // ASSESSMENT EVALUATION
    // ───────────────────────────────────────────────────────────

    public Map<String, Object> evaluateWithScore(String subject, int level, Map<String, String> answers) {
        String normalizedSubject = normalizeSubject(subject);
        List<Question> questions = repo.findBySubject(normalizedSubject);
        int correct = 0;

        for (Question q : questions) {
            String given = answers.get(q.getId().toString());
            if (given != null && given.equalsIgnoreCase(q.getCorrectAnswer())) {
                correct++;
            }
        }

        boolean passed = correct > 0;
        return Map.of("score", correct, "passed", passed);
    }

    // ───────────────────────────────────────────────────────────
    // CODING QUESTION HELPERS
    // ───────────────────────────────────────────────────────────

    public Optional<CodingDetail> getCodingDetail(Long questionId) {
        return codingDetailRepo.findByQuestionId(questionId);
    }

    public List<TestCase> getTestCases(Long questionId) {
        return testCaseRepo.findByQuestionId(questionId);
    }

    public List<Map<String, Object>> getManualQuestionsForHr(Long hrId, String subject) {
        return repo.findAll().stream()
                .filter(question -> canHrOwnQuestion(question, hrId))
                .filter(question -> subject == null
                        || subject.isBlank()
                        || subject.equalsIgnoreCase(question.getSubject()))
                .sorted(Comparator.comparing(Question::getSubject, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(Question::getId))
                .map(this::toQuestionBankEntry)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> createManualQuestionForHr(ManualQuestionDraft draft, Long hrId) {
        validateManualQuestionDraft(draft);

        Question question = buildQuestionEntity(draft, hrId);
        Question saved = repo.save(question);
        syncCodingArtifacts(saved, draft);
        return toQuestionBankEntry(saved);
    }

    @Transactional
    public Map<String, Object> updateManualQuestionForHr(Long questionId, ManualQuestionDraft draft, Long hrId) {
        validateManualQuestionDraft(draft);

        Question question = repo.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (!canHrOwnQuestion(question, hrId)) {
            throw new RuntimeException("You can update only your own HR questions");
        }

        question.setSubject(draft.subject().trim());
        question.setSectionName(draft.subject().trim());
        question.setLevel(1);

        if (draft.isCoding()) {
            question.setText("");
            question.setOptions(List.of());
            question.setCorrectAnswer("");
            question.setHasCompiler(true);
            question.setQuestionType("CODING");
        } else {
            question.setText(draft.questionText().trim());
            question.setOptions(draft.options().stream().map(String::trim).toList());
            question.setCorrectAnswer(draft.correctAnswer().trim());
            question.setHasCompiler(false);
            question.setQuestionType("MCQ");
        }

        Question saved = repo.save(question);
        syncCodingArtifacts(saved, draft);
        return toQuestionBankEntry(saved);
    }

    @Transactional
    public void deleteManualQuestionForHr(Long questionId, Long hrId) {
        Question question = repo.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (!canHrOwnQuestion(question, hrId)) {
            throw new RuntimeException("You can delete only your own HR questions");
        }

        if (assessmentQuestionRepo.existsByQuestion_Id(questionId)) {
            throw new RuntimeException("This question is already used in an assessment and cannot be deleted");
        }

        codingDetailRepo.findByQuestionId(questionId).ifPresent(codingDetailRepo::delete);
        List<TestCase> testCases = testCaseRepo.findByQuestionId(questionId);
        if (!testCases.isEmpty()) {
            testCaseRepo.deleteAll(testCases);
        }
        repo.delete(question);
    }

    private void validateManualQuestionDraft(ManualQuestionDraft draft) {
        if (draft == null) {
            throw new RuntimeException("Question data is required");
        }

        if (draft.subject() == null || draft.subject().trim().isBlank()) {
            throw new RuntimeException("Subject is required");
        }

        if (draft.isCoding()) {
            if (draft.codingDescription() == null || draft.codingDescription().trim().isBlank()) {
                throw new RuntimeException("Coding description is required");
            }
            if (draft.testCases() == null || draft.testCases().size() < 2) {
                throw new RuntimeException("At least two coding test cases are required");
            }
            for (int index = 0; index < draft.testCases().size(); index++) {
                ManualTestCaseDraft testCase = draft.testCases().get(index);
                if (testCase == null
                        || testCase.input() == null || testCase.input().trim().isBlank()
                        || testCase.expectedOutput() == null || testCase.expectedOutput().trim().isBlank()) {
                    throw new RuntimeException("Test case " + (index + 1) + " must include input and expected output");
                }
            }
            return;
        }

        if (draft.questionText() == null || draft.questionText().trim().isBlank()) {
            throw new RuntimeException("Question text is required");
        }
        if (draft.options() == null || draft.options().size() != 4) {
            throw new RuntimeException("Exactly four options are required");
        }

        List<String> cleanedOptions = draft.options().stream()
                .map(option -> option == null ? "" : option.trim())
                .toList();

        if (cleanedOptions.stream().anyMatch(String::isBlank)) {
            throw new RuntimeException("All four options are required");
        }

        if (draft.correctAnswer() == null || draft.correctAnswer().trim().isBlank()) {
            throw new RuntimeException("Correct answer is required");
        }

        boolean matchesOption = cleanedOptions.stream()
                .anyMatch(option -> option.equalsIgnoreCase(draft.correctAnswer().trim()));

        if (!matchesOption) {
            throw new RuntimeException("Correct answer must exactly match one of the options");
        }
    }

    private Question buildQuestionEntity(ManualQuestionDraft draft, Long hrId) {
        Question question;
        if (draft.isCoding()) {
            question = new Question(draft.subject().trim(), draft.subject().trim(), true, "CODING");
            question.setText("");
            question.setCorrectAnswer("");
            question.setOptions(List.of());
        } else {
            question = new Question(
                    1,
                    draft.questionText().trim(),
                    draft.options().stream().map(String::trim).toList(),
                    draft.correctAnswer().trim(),
                    draft.subject().trim(),
                    draft.subject().trim());
            question.setHasCompiler(false);
            question.setQuestionType("MCQ");
        }
        applyOwnership(question, "HR", hrId);
        return question;
    }

    private void syncCodingArtifacts(Question question, ManualQuestionDraft draft) {
        if (draft.isCoding()) {
            CodingDetail codingDetail = codingDetailRepo.findByQuestionId(question.getId()).orElseGet(CodingDetail::new);
            codingDetail.setQuestion(question);
            codingDetail.setDescription(draft.codingDescription().trim());
            codingDetailRepo.save(codingDetail);

            List<TestCase> existing = testCaseRepo.findByQuestionId(question.getId());
            if (!existing.isEmpty()) {
                testCaseRepo.deleteAll(existing);
            }

            List<TestCase> newCases = draft.testCases().stream()
                    .map(testCaseDraft -> {
                        TestCase testCase = new TestCase();
                        testCase.setQuestion(question);
                        testCase.setInput(testCaseDraft.input().trim());
                        testCase.setExpectedOutput(testCaseDraft.expectedOutput().trim());
                        return testCase;
                    })
                    .collect(Collectors.toList());
            testCaseRepo.saveAll(newCases);
            return;
        }

        codingDetailRepo.findByQuestionId(question.getId()).ifPresent(codingDetailRepo::delete);
        List<TestCase> existing = testCaseRepo.findByQuestionId(question.getId());
        if (!existing.isEmpty()) {
            testCaseRepo.deleteAll(existing);
        }
    }

    private Map<String, Object> toQuestionBankEntry(Question question) {
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("id", question.getId());
        entry.put("subject", question.getSubject());
        entry.put("sectionName", question.getSectionName());
        entry.put("questionType", question.getQuestionType());
        entry.put("hasCompiler", question.isHasCompiler());
        entry.put("questionText", question.isHasCompiler() ? "" : question.getText());
        entry.put("options", question.getOptions() != null ? question.getOptions() : List.of());
        entry.put("correctAnswer", question.isHasCompiler() ? "" : question.getCorrectAnswer());
        entry.put("codingDescription", question.isHasCompiler()
                ? codingDetailRepo.findByQuestionId(question.getId()).map(CodingDetail::getDescription).orElse("")
                : "");
        entry.put("testCases", question.isHasCompiler()
                ? testCaseRepo.findByQuestionId(question.getId()).stream()
                    .map(testCase -> Map.of(
                            "id", (Object) testCase.getId(),
                            "input", (Object) testCase.getInput(),
                            "expectedOutput", (Object) testCase.getExpectedOutput()))
                    .collect(Collectors.toList())
                : List.of());
        return entry;
    }

    private void applyOwnership(Question question, String createdByRole, Long createdByHrId) {
        question.setCreatedByRole(createdByRole != null && !createdByRole.isBlank() ? createdByRole : "ADMIN");
        question.setCreatedByHrId(createdByHrId);
    }

    private boolean canHrAccessQuestion(Question question, Long hrId) {
        String ownerRole = question.getCreatedByRole();
        if (ownerRole == null || ownerRole.isBlank() || "ADMIN".equalsIgnoreCase(ownerRole)) {
            return true;
        }
        return "HR".equalsIgnoreCase(ownerRole) && Objects.equals(question.getCreatedByHrId(), hrId);
    }

    private boolean canHrOwnQuestion(Question question, Long hrId) {
        return question != null
                && "HR".equalsIgnoreCase(question.getCreatedByRole())
                && Objects.equals(question.getCreatedByHrId(), hrId);
    }

    public record ManualQuestionDraft(
            String subject,
            String questionType,
            String questionText,
            List<String> options,
            String correctAnswer,
            String codingDescription,
            List<ManualTestCaseDraft> testCases) {
        public boolean isCoding() {
            return "CODING".equalsIgnoreCase(questionType);
        }
    }

    public record ManualTestCaseDraft(String input, String expectedOutput) {}
}
