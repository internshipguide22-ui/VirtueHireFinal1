interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    duration: string;
  }>;
  skills: string[];
}

interface Props {
  data: ResumeData;
  onEdit: (field: string, value: any) => void;
  isEditing: boolean;
}

export function ModernMinimal({ data, onEdit, isEditing }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-12 shadow-lg">
      {/* Header */}
      <div className="mb-8">
        {isEditing ? (
          <input
            type="text"
            value={data.personalInfo.name}
            onChange={(e) => onEdit('personalInfo.name', e.target.value)}
            className="w-full text-4xl font-light tracking-tight border-b border-gray-300 focus:outline-none focus:border-blue-500 mb-2"
            placeholder="Your Name"
          />
        ) : (
          <h1 className="text-4xl font-light tracking-tight mb-2">{data.personalInfo.name}</h1>
        )}

        {isEditing ? (
          <input
            type="text"
            value={data.personalInfo.title}
            onChange={(e) => onEdit('personalInfo.title', e.target.value)}
            className="w-full text-gray-600 border-b border-gray-300 focus:outline-none focus:border-blue-500"
            placeholder="Professional Title"
          />
        ) : (
          <p className="text-gray-600">{data.personalInfo.title}</p>
        )}

        <div className="flex gap-3 mt-4 text-sm text-gray-600 flex-wrap">
          {isEditing ? (
            <>
              <input
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => onEdit('personalInfo.email', e.target.value)}
                className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                placeholder="email@example.com"
              />
              <input
                type="tel"
                value={data.personalInfo.phone}
                onChange={(e) => onEdit('personalInfo.phone', e.target.value)}
                className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                placeholder="(123) 456-7890"
              />
              <input
                type="text"
                value={data.personalInfo.location}
                onChange={(e) => onEdit('personalInfo.location', e.target.value)}
                className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                placeholder="City, State"
              />
              <input
                type="text"
                value={data.personalInfo.linkedin}
                onChange={(e) => onEdit('personalInfo.linkedin', e.target.value)}
                className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                placeholder="linkedin.com/in/username"
              />
            </>
          ) : (
            <>
              <span>{data.personalInfo.email}</span>
              <span>{data.personalInfo.phone}</span>
              <span>{data.personalInfo.location}</span>
              <span>{data.personalInfo.linkedin}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8">
        <div className="border-l-4 border-gray-900 pl-4">
          {isEditing ? (
            <textarea
              value={data.summary}
              onChange={(e) => onEdit('summary', e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 text-sm"
              rows={3}
              placeholder="Professional summary..."
            />
          ) : (
            <p className="text-sm text-gray-700">{data.summary}</p>
          )}
        </div>
      </div>

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-4 text-gray-900">Experience</h2>
        <div className="space-y-5">
          {data.experience.map((exp, index) => (
            <div key={exp.id}>
              {isEditing ? (
                <>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => onEdit(`experience.${index}.position`, e.target.value)}
                        className="w-full font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500 mb-1"
                        placeholder="Job Title"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => onEdit(`experience.${index}.company`, e.target.value)}
                        className="w-full text-sm text-gray-600 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                        placeholder="Company Name"
                      />
                    </div>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => onEdit(`experience.${index}.duration`, e.target.value)}
                      className="text-sm text-gray-500 border-b border-gray-300 focus:outline-none focus:border-blue-500 ml-4"
                      placeholder="2020 - Present"
                    />
                  </div>
                  <textarea
                    value={exp.description}
                    onChange={(e) => onEdit(`experience.${index}.description`, e.target.value)}
                    className="w-full text-sm text-gray-700 mt-2 border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                    rows={2}
                    placeholder="Description..."
                  />
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{exp.position}</p>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                    </div>
                    <span className="text-sm text-gray-500">{exp.duration}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-4 text-gray-900">Education</h2>
        <div className="space-y-3">
          {data.education.map((edu, index) => (
            <div key={edu.id}>
              {isEditing ? (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => onEdit(`education.${index}.degree`, e.target.value)}
                      className="w-full font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500 mb-1"
                      placeholder="Degree"
                    />
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => onEdit(`education.${index}.school`, e.target.value)}
                      className="w-full text-sm text-gray-600 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      placeholder="School Name"
                    />
                  </div>
                  <input
                    type="text"
                    value={edu.duration}
                    onChange={(e) => onEdit(`education.${index}.duration`, e.target.value)}
                    className="text-sm text-gray-500 border-b border-gray-300 focus:outline-none focus:border-blue-500 ml-4"
                    placeholder="2016 - 2020"
                  />
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{edu.degree}</p>
                    <p className="text-sm text-gray-600">{edu.school}</p>
                  </div>
                  <span className="text-sm text-gray-500">{edu.duration}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-4 text-gray-900">Skills</h2>
        {isEditing ? (
          <input
            type="text"
            value={data.skills.join(', ')}
            onChange={(e) => onEdit('skills', e.target.value.split(', '))}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 text-sm"
            placeholder="Skill 1, Skill 2, Skill 3, ..."
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-sm rounded">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
