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

export function TwoColumnExecutive({ data, onEdit, isEditing }: Props) {
  return (
    <div className="w-full max-w-5xl mx-auto bg-white shadow-lg flex">
      {/* Left Sidebar */}
      <div className="w-2/5 bg-gray-800 text-white p-8">
        {/* Contact */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-4 border-b border-gray-600 pb-2">Contact</h2>
          <div className="space-y-3 text-sm">
            {isEditing ? (
              <>
                <input
                  type="email"
                  value={data.personalInfo.email}
                  onChange={(e) => onEdit('personalInfo.email', e.target.value)}
                  className="w-full bg-gray-700 border-b border-gray-600 focus:outline-none focus:border-white px-2 py-1"
                  placeholder="email@example.com"
                />
                <input
                  type="tel"
                  value={data.personalInfo.phone}
                  onChange={(e) => onEdit('personalInfo.phone', e.target.value)}
                  className="w-full bg-gray-700 border-b border-gray-600 focus:outline-none focus:border-white px-2 py-1"
                  placeholder="(123) 456-7890"
                />
                <input
                  type="text"
                  value={data.personalInfo.location}
                  onChange={(e) => onEdit('personalInfo.location', e.target.value)}
                  className="w-full bg-gray-700 border-b border-gray-600 focus:outline-none focus:border-white px-2 py-1"
                  placeholder="City, State"
                />
                <input
                  type="text"
                  value={data.personalInfo.linkedin}
                  onChange={(e) => onEdit('personalInfo.linkedin', e.target.value)}
                  className="w-full bg-gray-700 border-b border-gray-600 focus:outline-none focus:border-white px-2 py-1"
                  placeholder="linkedin.com/in/username"
                />
              </>
            ) : (
              <>
                <p>{data.personalInfo.email}</p>
                <p>{data.personalInfo.phone}</p>
                <p>{data.personalInfo.location}</p>
                <p>{data.personalInfo.linkedin}</p>
              </>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-4 border-b border-gray-600 pb-2">Skills</h2>
          {isEditing ? (
            <textarea
              value={data.skills.join('\n')}
              onChange={(e) => onEdit('skills', e.target.value.split('\n'))}
              className="w-full bg-gray-700 border border-gray-600 focus:outline-none focus:border-white px-2 py-1 text-sm"
              rows={6}
              placeholder="One skill per line"
            />
          ) : (
            <ul className="space-y-2 text-sm">
              {data.skills.map((skill, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Education */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-4 border-b border-gray-600 pb-2">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={edu.id} className="text-sm">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => onEdit(`education.${index}.degree`, e.target.value)}
                      className="w-full font-semibold bg-gray-700 border-b border-gray-600 focus:outline-none focus:border-white px-2 py-1 mb-1"
                      placeholder="Degree"
                    />
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => onEdit(`education.${index}.school`, e.target.value)}
                      className="w-full bg-gray-700 border-b border-gray-600 focus:outline-none focus:border-white px-2 py-1 mb-1"
                      placeholder="School"
                    />
                    <input
                      type="text"
                      value={edu.duration}
                      onChange={(e) => onEdit(`education.${index}.duration`, e.target.value)}
                      className="w-full text-gray-400 bg-gray-700 border-b border-gray-600 focus:outline-none focus:border-white px-2 py-1"
                      placeholder="2016 - 2020"
                    />
                  </>
                ) : (
                  <>
                    <p className="font-semibold">{edu.degree}</p>
                    <p>{edu.school}</p>
                    <p className="text-gray-400">{edu.duration}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Main Content */}
      <div className="w-3/5 p-8">
        {/* Header */}
        <div className="mb-8">
          {isEditing ? (
            <>
              <input
                type="text"
                value={data.personalInfo.name}
                onChange={(e) => onEdit('personalInfo.name', e.target.value)}
                className="w-full text-3xl font-bold border-b border-gray-300 focus:outline-none focus:border-blue-500 mb-2"
                placeholder="Your Name"
              />
              <input
                type="text"
                value={data.personalInfo.title}
                onChange={(e) => onEdit('personalInfo.title', e.target.value)}
                className="w-full text-xl text-gray-600 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                placeholder="Professional Title"
              />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">{data.personalInfo.name}</h1>
              <p className="text-xl text-gray-600">{data.personalInfo.title}</p>
            </>
          )}
        </div>

        {/* Summary */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-3 text-gray-800">Profile</h2>
          {isEditing ? (
            <textarea
              value={data.summary}
              onChange={(e) => onEdit('summary', e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 text-sm"
              rows={4}
              placeholder="Professional summary..."
            />
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
          )}
        </div>

        {/* Experience */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-4 text-gray-800">Experience</h2>
          <div className="space-y-6">
            {data.experience.map((exp, index) => (
              <div key={exp.id}>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => onEdit(`experience.${index}.position`, e.target.value)}
                      className="w-full font-semibold border-b border-gray-300 focus:outline-none focus:border-blue-500 mb-1"
                      placeholder="Job Title"
                    />
                    <div className="flex justify-between mb-2">
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => onEdit(`experience.${index}.company`, e.target.value)}
                        className="text-sm text-gray-600 border-b border-gray-300 focus:outline-none focus:border-blue-500 flex-1 mr-2"
                        placeholder="Company"
                      />
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => onEdit(`experience.${index}.duration`, e.target.value)}
                        className="text-sm text-gray-500 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                        placeholder="2020 - Present"
                      />
                    </div>
                    <textarea
                      value={exp.description}
                      onChange={(e) => onEdit(`experience.${index}.description`, e.target.value)}
                      className="w-full text-sm text-gray-700 border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                      rows={2}
                      placeholder="Description..."
                    />
                  </>
                ) : (
                  <>
                    <p className="font-semibold">{exp.position}</p>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">{exp.company}</span>
                      <span className="text-gray-500">{exp.duration}</span>
                    </div>
                    <p className="text-sm text-gray-700">{exp.description}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
