import React from "react";
import "./ResumeTemplateRender.css";

function hasContent(value) {
  if (Array.isArray(value)) {
    return value.some(Boolean);
  }
  return Boolean(value && String(value).trim());
}

function filterEntries(items) {
  return Array.isArray(items)
    ? items.filter((item) => item && Object.values(item).some(hasContent))
    : [];
}

function buildPreviewData(formState) {
  const experience = filterEntries(formState.experience).map((item, index) => ({
    id: `exp-${index}`,
    company: item.company || "",
    position: item.role || "",
    duration: item.duration || "",
    description: item.description || "",
  }));

  const education = filterEntries(formState.education).map((item, index) => ({
    id: `edu-${index}`,
    school: item.institution || "",
    degree: item.degree || "",
    duration: item.duration || "",
    description: item.description || "",
  }));

  return {
    personalInfo: {
      name: formState.personalInfo.name || "Your Name",
      title:
        formState.personalInfo.title ||
        experience[0]?.position ||
        "Professional Title",
      email: formState.personalInfo.email || "",
      phone: formState.personalInfo.phone || "",
      location: formState.personalInfo.location || "",
      linkedin: formState.personalInfo.linkedin || "",
      portfolio: formState.personalInfo.portfolio || "",
    },
    summary:
      formState.professionalSummary ||
      "Write a concise summary aligned to your target role to see it here.",
    experience,
    education,
    skills: Array.isArray(formState.skills) ? formState.skills.filter(hasContent) : [],
    projects: filterEntries(formState.projects),
    certifications: filterEntries(formState.certifications),
    achievements: Array.isArray(formState.achievements)
      ? formState.achievements.filter(hasContent)
      : [],
  };
}

function ContactLine({ data, separator = "•" }) {
  const contactParts = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
    data.personalInfo.linkedin,
    data.personalInfo.portfolio,
  ].filter(hasContent);

  return contactParts.length ? contactParts.join(` ${separator} `) : "Email • Phone • Location";
}

function SectionList({ items, renderItem, emptyText, className = "" }) {
  return items.length ? (
    <div className={className}>{items.map(renderItem)}</div>
  ) : (
    <p className="resume-template-empty">{emptyText}</p>
  );
}

function SharedProjectSection({ projects, variant }) {
  if (!projects.length) return null;
  return (
    <section className={`resume-template-section resume-template-section-${variant}`}>
      <h4>Projects</h4>
      <div className="resume-template-stack">
        {projects.map((project, index) => (
          <article key={`project-${index}`} className="resume-template-item">
            <strong>{[project.name, project.role].filter(hasContent).join(" | ") || "Project"}</strong>
            {project.duration ? <span>{project.duration}</span> : null}
            {project.description ? <p>{project.description}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function SharedCertificationSection({ certifications, variant }) {
  if (!certifications.length) return null;
  return (
    <section className={`resume-template-section resume-template-section-${variant}`}>
      <h4>Certifications</h4>
      <div className="resume-template-stack">
        {certifications.map((certification, index) => (
          <article key={`cert-${index}`} className="resume-template-item">
            <strong>{[certification.name, certification.issuer].filter(hasContent).join(" | ") || "Certification"}</strong>
            {certification.year ? <span>{certification.year}</span> : null}
            {certification.description ? <p>{certification.description}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function SharedAchievementSection({ achievements, variant }) {
  if (!achievements.length) return null;
  return (
    <section className={`resume-template-section resume-template-section-${variant}`}>
      <h4>Achievements</h4>
      <ul className="resume-template-bullets">
        {achievements.map((achievement) => (
          <li key={achievement}>{achievement}</li>
        ))}
      </ul>
    </section>
  );
}

function ClassicProfessionalTemplate({ data }) {
  return (
    <div className="resume-template-preview-root resume-template-classic">
      <header className="resume-template-header resume-template-header-classic">
        <h2>{data.personalInfo.name}</h2>
        <p className="resume-template-role">{data.personalInfo.title}</p>
        <p className="resume-template-contact center">{ContactLine({ data })}</p>
      </header>

      <section className="resume-template-section resume-template-section-classic">
        <h4>Professional Summary</h4>
        <p>{data.summary}</p>
      </section>

      <section className="resume-template-section resume-template-section-classic">
        <h4>Experience</h4>
        <SectionList
          items={data.experience}
          emptyText="Add experience details to preview them here."
          className="resume-template-stack"
          renderItem={(item) => (
            <article key={item.id} className="resume-template-item">
              <div className="resume-template-row spread">
                <strong>{item.position || "Job Title"}</strong>
                <span>{item.duration}</span>
              </div>
              <em>{item.company}</em>
              {item.description ? <p>{item.description}</p> : null}
            </article>
          )}
        />
      </section>

      <section className="resume-template-section resume-template-section-classic">
        <h4>Education</h4>
        <SectionList
          items={data.education}
          emptyText="Add education details to preview them here."
          className="resume-template-stack"
          renderItem={(item) => (
            <article key={item.id} className="resume-template-item">
              <div className="resume-template-row spread">
                <strong>{item.degree || "Degree"}</strong>
                <span>{item.duration}</span>
              </div>
              <em>{item.school}</em>
              {item.description ? <p>{item.description}</p> : null}
            </article>
          )}
        />
      </section>

      <section className="resume-template-section resume-template-section-classic">
        <h4>Skills</h4>
        {data.skills.length ? (
          <p>{data.skills.join(" • ")}</p>
        ) : (
          <p className="resume-template-empty">Add skills to preview them here.</p>
        )}
      </section>

      <SharedProjectSection projects={data.projects} variant="classic" />
      <SharedCertificationSection certifications={data.certifications} variant="classic" />
      <SharedAchievementSection achievements={data.achievements} variant="classic" />
    </div>
  );
}

function ModernMinimalTemplate({ data }) {
  return (
    <div className="resume-template-preview-root resume-template-modern">
      <header className="resume-template-header resume-template-header-modern">
        <h2>{data.personalInfo.name}</h2>
        <p className="resume-template-role">{data.personalInfo.title}</p>
        <p className="resume-template-contact">{ContactLine({ data, separator: "|" })}</p>
      </header>

      <section className="resume-template-summary-modern">
        <p>{data.summary}</p>
      </section>

      <section className="resume-template-section resume-template-section-modern">
        <h4>Experience</h4>
        <SectionList
          items={data.experience}
          emptyText="Add experience details to preview them here."
          className="resume-template-stack spacious"
          renderItem={(item) => (
            <article key={item.id} className="resume-template-item">
              <div className="resume-template-row spread top">
                <div>
                  <strong>{item.position || "Job Title"}</strong>
                  <p className="resume-template-subtle">{item.company}</p>
                </div>
                <span>{item.duration}</span>
              </div>
              {item.description ? <p>{item.description}</p> : null}
            </article>
          )}
        />
      </section>

      <section className="resume-template-section resume-template-section-modern">
        <h4>Education</h4>
        <SectionList
          items={data.education}
          emptyText="Add education details to preview them here."
          className="resume-template-stack"
          renderItem={(item) => (
            <article key={item.id} className="resume-template-item">
              <div className="resume-template-row spread top">
                <div>
                  <strong>{item.degree || "Degree"}</strong>
                  <p className="resume-template-subtle">{item.school}</p>
                </div>
                <span>{item.duration}</span>
              </div>
              {item.description ? <p>{item.description}</p> : null}
            </article>
          )}
        />
      </section>

      <section className="resume-template-section resume-template-section-modern">
        <h4>Skills</h4>
        {data.skills.length ? (
          <div className="resume-template-chip-row muted">
            {data.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        ) : (
          <p className="resume-template-empty">Add skills to preview them here.</p>
        )}
      </section>

      <SharedProjectSection projects={data.projects} variant="modern" />
      <SharedCertificationSection certifications={data.certifications} variant="modern" />
      <SharedAchievementSection achievements={data.achievements} variant="modern" />
    </div>
  );
}

function ExecutiveTemplate({ data }) {
  // FIX: Converted to single-column ATS-friendly layout
  // Two-column layouts can confuse ATS systems that read left-to-right, top-to-bottom
  return (
    <div className="resume-template-preview-root resume-template-executive">
      <header className="resume-template-header resume-template-header-executive">
        <h2>{data.personalInfo.name}</h2>
        <p className="resume-template-role">{data.personalInfo.title}</p>
        <p className="resume-template-contact center">{ContactLine({ data })}</p>
      </header>

      <section className="resume-template-section resume-template-section-executive">
        <h4>Professional Summary</h4>
        <p>{data.summary}</p>
      </section>

      <section className="resume-template-section resume-template-section-executive">
        <h4>Core Competencies</h4>
        {data.skills.length ? (
          <p className="resume-template-skills-executive">{data.skills.join(" • ")}</p>
        ) : (
          <p className="resume-template-empty">Add skills to preview them here.</p>
        )}
      </section>

      <section className="resume-template-section resume-template-section-executive">
        <h4>Professional Experience</h4>
        <SectionList
          items={data.experience}
          emptyText="Add experience details to preview them here."
          className="resume-template-stack"
          renderItem={(item) => (
            <article key={item.id} className="resume-template-item">
              <div className="resume-template-row spread">
                <strong>{item.position || "Job Title"}</strong>
                <span>{item.duration}</span>
              </div>
              <em>{item.company}</em>
              {item.description ? <p>{item.description}</p> : null}
            </article>
          )}
        />
      </section>

      <section className="resume-template-section resume-template-section-executive">
        <h4>Education</h4>
        <SectionList
          items={data.education}
          emptyText="Add education details to preview them here."
          className="resume-template-stack"
          renderItem={(item) => (
            <article key={item.id} className="resume-template-item">
              <div className="resume-template-row spread">
                <strong>{item.degree || "Degree"}</strong>
                <span>{item.duration}</span>
              </div>
              <em>{item.school}</em>
            </article>
          )}
        />
      </section>

      <SharedProjectSection projects={data.projects} variant="executive" />
      <SharedCertificationSection certifications={data.certifications} variant="executive" />
      <SharedAchievementSection achievements={data.achievements} variant="executive" />
    </div>
  );
}

function CleanStructuredTemplate({ data }) {
  return (
    <div className="resume-template-preview-root resume-template-structured">
      <header className="resume-template-header resume-template-header-structured">
        <h2>{data.personalInfo.name}</h2>
        <p className="resume-template-role">{data.personalInfo.title}</p>
        <div className="resume-template-structured-grid">
          {[data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location, data.personalInfo.linkedin || data.personalInfo.portfolio]
            .filter(hasContent)
            .map((item) => (
              <span key={item}>{item}</span>
            ))}
        </div>
      </header>

      <section className="resume-template-section resume-template-section-structured">
        <h4>Summary</h4>
        <p>{data.summary}</p>
      </section>

      <section className="resume-template-section resume-template-section-structured">
        <h4>Experience</h4>
        <SectionList
          items={data.experience}
          emptyText="Add experience details to preview them here."
          className="resume-template-stack"
          renderItem={(item) => (
            <article key={item.id} className="resume-template-item structured">
              <strong>{item.position || "Job Title"}</strong>
              <div className="resume-template-row spread">
                <em>{item.company}</em>
                <span>{item.duration}</span>
              </div>
              {item.description ? <p>{item.description}</p> : null}
            </article>
          )}
        />
      </section>

      <section className="resume-template-section resume-template-section-structured">
        <h4>Education</h4>
        <SectionList
          items={data.education}
          emptyText="Add education details to preview them here."
          className="resume-template-stack"
          renderItem={(item) => (
            <article key={item.id} className="resume-template-item structured">
              <strong>{item.degree || "Degree"}</strong>
              <div className="resume-template-row spread">
                <em>{item.school}</em>
                <span>{item.duration}</span>
              </div>
              {item.description ? <p>{item.description}</p> : null}
            </article>
          )}
        />
      </section>

      <section className="resume-template-section resume-template-section-structured">
        <h4>Skills</h4>
        {data.skills.length ? (
          <div className="resume-template-skill-grid">
            {data.skills.map((skill) => (
              <div key={skill} className="resume-template-skill-grid-item">
                <span />
                {skill}
              </div>
            ))}
          </div>
        ) : (
          <p className="resume-template-empty">Add skills to preview them here.</p>
        )}
      </section>

      <SharedProjectSection projects={data.projects} variant="structured" />
      <SharedCertificationSection certifications={data.certifications} variant="structured" />
      <SharedAchievementSection achievements={data.achievements} variant="structured" />
    </div>
  );
}

function SimpleElegantTemplate({ data }) {
  return (
    <div className="resume-template-preview-root resume-template-elegant">
      <header className="resume-template-header resume-template-header-elegant">
        <h2>{data.personalInfo.name.toUpperCase()}</h2>
        <p className="resume-template-role">{data.personalInfo.title}</p>
        <p className="resume-template-contact center">{ContactLine({ data, separator: "|" })}</p>
      </header>

      <section className="resume-template-section resume-template-section-elegant centered">
        <p className="resume-template-italic">{data.summary}</p>
      </section>

      <section className="resume-template-section resume-template-section-elegant centered">
        <h4>Experience</h4>
        <SectionList
          items={data.experience}
          emptyText="Add experience details to preview them here."
          className="resume-template-stack spacious"
          renderItem={(item) => (
            <article key={item.id} className="resume-template-item centered">
              <strong>{item.position || "Job Title"}</strong>
              <em>{item.company}</em>
              <span>{item.duration}</span>
              {item.description ? <p>{item.description}</p> : null}
            </article>
          )}
        />
      </section>

      <section className="resume-template-section resume-template-section-elegant centered">
        <h4>Education</h4>
        <SectionList
          items={data.education}
          emptyText="Add education details to preview them here."
          className="resume-template-stack"
          renderItem={(item) => (
            <article key={item.id} className="resume-template-item centered">
              <strong>{item.degree || "Degree"}</strong>
              <em>{item.school}</em>
              <span>{item.duration}</span>
              {item.description ? <p>{item.description}</p> : null}
            </article>
          )}
        />
      </section>

      <section className="resume-template-section resume-template-section-elegant centered">
        <h4>Skills</h4>
        {data.skills.length ? (
          <p>{data.skills.join(" • ")}</p>
        ) : (
          <p className="resume-template-empty">Add skills to preview them here.</p>
        )}
      </section>

      <SharedProjectSection projects={data.projects} variant="elegant" />
      <SharedCertificationSection certifications={data.certifications} variant="elegant" />
      <SharedAchievementSection achievements={data.achievements} variant="elegant" />
    </div>
  );
}

export function ResumeTemplateRender({ templateId, formState }) {
  const data = buildPreviewData(formState);
  
  // FIX: Map old template IDs to new ATS-friendly versions
  const normalizedTemplateId = templateId === "two-column-executive" ? "executive" : templateId;

  switch (normalizedTemplateId) {
    case "classic-professional":
      return <ClassicProfessionalTemplate data={data} />;
    case "clean-structured":
      return <CleanStructuredTemplate data={data} />;
    case "modern-minimal":
      return <ModernMinimalTemplate data={data} />;
    case "simple-elegant":
      return <SimpleElegantTemplate data={data} />;
    case "executive":
      return <ExecutiveTemplate data={data} />;
    default:
      return <ClassicProfessionalTemplate data={data} />;
  }
}

export function ResumeTemplateThumbnail({ templateId }) {
  // FIX: Map old template IDs for thumbnail display
  const normalizedId = templateId === "two-column-executive" ? "executive" : templateId;
  
  const thumbnailClass = {
    "classic-professional": "classic",
    "clean-structured": "structured",
    "modern-minimal": "modern",
    "simple-elegant": "elegant",
    "executive": "executive",
  }[normalizedId] || "classic";

  return (
    <div className={`resume-template-thumb resume-template-thumb-${thumbnailClass}`}>
      <div className="resume-template-thumb-sheet">
        <div className="resume-template-thumb-header" />
        <div className="resume-template-thumb-line short" />
        <div className="resume-template-thumb-line medium" />
        <div className="resume-template-thumb-block" />
        <div className="resume-template-thumb-grid">
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
