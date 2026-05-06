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

export function SimpleElegant({ data, onEdit, isEditing }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-12 shadow-lg">
      {/* Header */}
      <div className="text-center mb-10">
        {isEditing ? (
          <>
            <input
              type="text"
              value={data.personalInfo.name}
              onChange={(e) => onEdit('personalInfo.name', e.target.value)}
              className="w-full text-center text-3xl tracking-wide border-b border-gray-300 focus:outline-none focus:border-blue-500 mb-3"
              placeholder="YOUR NAME"
            />
            <input
              type="text"
              value={data.personalInfo.title}
              onChange={(e) => onEdit('personalInfo.title', e.target.value)}
              className="w-full text-center text-gray-600 border-b border-gray-300 focus:outline-none focus:border-blue-500 mb-4"
              placeholder="Professional Title"
            />
          </>
        ) : (
          <>
            <h1 className="text-3xl tracking-wide mb-1">{data.personalInfo.name.toUpperCase()}</h1>
            <p className="text-gray-600 mb-4">{data.personalInfo.title}</p>
          </>
        )}

        <div className="flex justify-center flex-wrap gap-4 text-sm text-gray-600 border-t border-b border-gray-300 py-3">
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
              <span>|</span>
              <span>{data.personalInfo.phone}</span>
              <span>|</span>
              <span>{data.personalInfo.location}</span>
              <span>|</span>
              <span>{data.personalInfo.linkedin}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8">
        {isEditing ? (
          <textarea
            value={data.summary}
            onChange={(e) => onEdit('summary', e.target.value)}
            className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-blue-500 text-sm text-center italic"
            rows={3}
            placeholder="Professional summary..."
          />
        ) : (
          <p className="text-sm text-center italic text-gray-700 leading-relaxed">{data.summary}</p>
        )}
      </div>

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-center text-lg tracking-widest mb-6 pb-2 border-b border-gray-400">E X P E R I E N C E</h2>
        <div className="space-y-6">
          {data.experience.map((exp, index) => (
            <div key={exp.id}>
              {isEditing ? (
                <>
                  <div className="text-center mb-2">
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => onEdit(`experience.${index}.position`, e.target.value)}
                      className="w-full text-center font-semibold border-b border-gray-300 focus:outline-none focus:border-blue-500 mb-1"
                      placeholder="Job Title"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => onEdit(`experience.${index}.company`, e.target.value)}
                      className="w-full text-center text-sm italic border-b border-gray-300 focus:outline-none focus:border-blue-500 mb-1"
                      placeholder="Company Name"
                    />
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => onEdit(`experience.${index}.duration`, e.target.value)}
                      className="w-full text-center text-sm text-gray-600 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      placeholder="Jan 2020 - Present"
                    />
                  </div>
                  <textarea
                    value={exp.description}
                    onChange={(e) => onEdit(`experience.${index}.description`, e.target.value)}
                    className="w-full text-sm text-center border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                    rows={2}
                    placeholder="Description..."
                  />
                </>
              ) : (
                <>
                  <div className="text-center mb-2">
                    <p className="font-semibold">{exp.position}</p>
                    <p className="text-sm italic">{exp.company}</p>
                    <p className="text-sm text-gray-600">{exp.duration}</p>
                  </div>
                  <p className="text-sm text-center">{exp.description}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-8">
        <h2 className="text-center text-lg tracking-widest mb-6 pb-2 border-b border-gray-400">E D U C A T I O N</h2>
        <div className="space-y-4">
          {data.education.map((edu, index) => (
            <div key={edu.id} className="text-center">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => onEdit(`education.${index}.degree`, e.target.value)}
                    className="w-full text-center font-semibold border-b border-gray-300 focus:outline-none focus:border-blue-500 mb-1"
                    placeholder="Degree"
                  />
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => onEdit(`education.${index}.school`, e.target.value)}
                    className="w-full text-center text-sm italic border-b border-gray-300 focus:outline-none focus:border-blue-500 mb-1"
                    placeholder="School Name"
                  />
                  <input
                    type="text"
                    value={edu.duration}
                    onChange={(e) => onEdit(`education.${index}.duration`, e.target.value)}
                    className="w-full text-center text-sm text-gray-600 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                    placeholder="2016 - 2020"
                  />
                </>
              ) : (
                <>
                  <p className="font-semibold">{edu.degree}</p>
                  <p className="text-sm italic">{edu.school}</p>
                  <p className="text-sm text-gray-600">{edu.duration}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-center text-lg tracking-widest mb-6 pb-2 border-b border-gray-400">S K I L L S</h2>
        {isEditing ? (
          <input
            type="text"
            value={data.skills.join(', ')}
            onChange={(e) => onEdit('skills', e.target.value.split(', '))}
            className="w-full text-center border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 text-sm"
            placeholder="Skill 1, Skill 2, Skill 3, ..."
          />
        ) : (
          <p className="text-sm text-center">{data.skills.join(' • ')}</p>
        )}
      </div>
    </div>
  );
}
