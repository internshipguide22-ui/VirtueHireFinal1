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

export function CleanStructured({ data, onEdit, isEditing }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-12 shadow-lg">
      {/* Header */}
      <div className="bg-blue-900 text-white p-6 -m-12 mb-8">
        {isEditing ? (
          <>
            <input
              type="text"
              value={data.personalInfo.name}
              onChange={(e) => onEdit('personalInfo.name', e.target.value)}
              className="w-full text-3xl font-bold bg-blue-800 border-b border-blue-700 focus:outline-none focus:border-white px-2 py-1 mb-2"
              placeholder="Your Name"
            />
            <input
              type="text"
              value={data.personalInfo.title}
              onChange={(e) => onEdit('personalInfo.title', e.target.value)}
              className="w-full text-lg bg-blue-800 border-b border-blue-700 focus:outline-none focus:border-white px-2 py-1"
              placeholder="Professional Title"
            />
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-1">{data.personalInfo.name}</h1>
            <p className="text-lg">{data.personalInfo.title}</p>
          </>
        )}

        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
          {isEditing ? (
            <>
              <input
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => onEdit('personalInfo.email', e.target.value)}
                className="bg-blue-800 border-b border-blue-700 focus:outline-none focus:border-white px-2 py-1"
                placeholder="email@example.com"
              />
              <input
                type="tel"
                value={data.personalInfo.phone}
                onChange={(e) => onEdit('personalInfo.phone', e.target.value)}
                className="bg-blue-800 border-b border-blue-700 focus:outline-none focus:border-white px-2 py-1"
                placeholder="(123) 456-7890"
              />
              <input
                type="text"
                value={data.personalInfo.location}
                onChange={(e) => onEdit('personalInfo.location', e.target.value)}
                className="bg-blue-800 border-b border-blue-700 focus:outline-none focus:border-white px-2 py-1"
                placeholder="City, State"
              />
              <input
                type="text"
                value={data.personalInfo.linkedin}
                onChange={(e) => onEdit('personalInfo.linkedin', e.target.value)}
                className="bg-blue-800 border-b border-blue-700 focus:outline-none focus:border-white px-2 py-1"
                placeholder="linkedin.com/in/username"
              />
            </>
          ) : (
            <>
              <div>{data.personalInfo.email}</div>
              <div>{data.personalInfo.phone}</div>
              <div>{data.personalInfo.location}</div>
              <div>{data.personalInfo.linkedin}</div>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-blue-900 border-b-2 border-blue-900 pb-1 mb-3">SUMMARY</h2>
        {isEditing ? (
          <textarea
            value={data.summary}
            onChange={(e) => onEdit('summary', e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 text-sm"
            rows={3}
            placeholder="Professional summary..."
          />
        ) : (
          <p className="text-sm">{data.summary}</p>
        )}
      </div>

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-blue-900 border-b-2 border-blue-900 pb-1 mb-4">EXPERIENCE</h2>
        <div className="space-y-5">
          {data.experience.map((exp, index) => (
            <div key={exp.id} className="pl-4 border-l-2 border-gray-300">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => onEdit(`experience.${index}.position`, e.target.value)}
                    className="w-full font-semibold text-blue-900 border-b border-gray-300 focus:outline-none focus:border-blue-500 mb-1"
                    placeholder="Job Title"
                  />
                  <div className="flex justify-between text-sm mb-2">
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => onEdit(`experience.${index}.company`, e.target.value)}
                      className="italic border-b border-gray-300 focus:outline-none focus:border-blue-500 flex-1 mr-2"
                      placeholder="Company"
                    />
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => onEdit(`experience.${index}.duration`, e.target.value)}
                      className="text-gray-600 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      placeholder="2020 - Present"
                    />
                  </div>
                  <textarea
                    value={exp.description}
                    onChange={(e) => onEdit(`experience.${index}.description`, e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                    rows={2}
                    placeholder="Description..."
                  />
                </>
              ) : (
                <>
                  <p className="font-semibold text-blue-900">{exp.position}</p>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="italic">{exp.company}</span>
                    <span className="text-gray-600">{exp.duration}</span>
                  </div>
                  <p className="text-sm">{exp.description}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-blue-900 border-b-2 border-blue-900 pb-1 mb-4">EDUCATION</h2>
        <div className="space-y-4">
          {data.education.map((edu, index) => (
            <div key={edu.id} className="pl-4 border-l-2 border-gray-300">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => onEdit(`education.${index}.degree`, e.target.value)}
                    className="w-full font-semibold text-blue-900 border-b border-gray-300 focus:outline-none focus:border-blue-500 mb-1"
                    placeholder="Degree"
                  />
                  <div className="flex justify-between text-sm">
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => onEdit(`education.${index}.school`, e.target.value)}
                      className="italic border-b border-gray-300 focus:outline-none focus:border-blue-500 flex-1 mr-2"
                      placeholder="School"
                    />
                    <input
                      type="text"
                      value={edu.duration}
                      onChange={(e) => onEdit(`education.${index}.duration`, e.target.value)}
                      className="text-gray-600 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      placeholder="2016 - 2020"
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="font-semibold text-blue-900">{edu.degree}</p>
                  <div className="flex justify-between text-sm">
                    <span className="italic">{edu.school}</span>
                    <span className="text-gray-600">{edu.duration}</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-lg font-bold text-blue-900 border-b-2 border-blue-900 pb-1 mb-3">SKILLS</h2>
        {isEditing ? (
          <input
            type="text"
            value={data.skills.join(', ')}
            onChange={(e) => onEdit('skills', e.target.value.split(', '))}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 text-sm"
            placeholder="Skill 1, Skill 2, Skill 3, ..."
          />
        ) : (
          <div className="grid grid-cols-3 gap-2 text-sm">
            {data.skills.map((skill, index) => (
              <div key={index} className="flex items-center">
                <span className="w-2 h-2 bg-blue-900 rounded-full mr-2"></span>
                {skill}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
