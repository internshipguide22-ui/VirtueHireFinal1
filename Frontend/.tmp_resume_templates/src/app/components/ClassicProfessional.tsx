import { Edit2 } from 'lucide-react';

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

export function ClassicProfessional({ data, onEdit, isEditing }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-12 shadow-lg">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        {isEditing ? (
          <input
            type="text"
            value={data.personalInfo.name}
            onChange={(e) => onEdit('personalInfo.name', e.target.value)}
            className="w-full text-center text-3xl font-bold border-b border-gray-300 focus:outline-none focus:border-blue-500"
            placeholder="Your Name"
          />
        ) : (
          <h1 className="text-3xl font-bold">{data.personalInfo.name}</h1>
        )}

        {isEditing ? (
          <input
            type="text"
            value={data.personalInfo.title}
            onChange={(e) => onEdit('personalInfo.title', e.target.value)}
            className="w-full text-center text-lg mt-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
            placeholder="Professional Title"
          />
        ) : (
          <p className="text-lg mt-2">{data.personalInfo.title}</p>
        )}

        <div className="flex justify-center gap-4 mt-3 text-sm flex-wrap">
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
              <span>•</span>
              <span>{data.personalInfo.phone}</span>
              <span>•</span>
              <span>{data.personalInfo.location}</span>
              <span>•</span>
              <span>{data.personalInfo.linkedin}</span>
            </>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      <div className="mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wide mb-3">Professional Summary</h2>
        {isEditing ? (
          <textarea
            value={data.summary}
            onChange={(e) => onEdit('summary', e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
            rows={4}
            placeholder="Brief professional summary highlighting your expertise and goals..."
          />
        ) : (
          <p className="text-sm leading-relaxed">{data.summary}</p>
        )}
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wide mb-3">Experience</h2>
        {data.experience.map((exp, index) => (
          <div key={exp.id} className="mb-4">
            {isEditing ? (
              <>
                <div className="flex justify-between mb-1">
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => onEdit(`experience.${index}.position`, e.target.value)}
                    className="font-semibold border-b border-gray-300 focus:outline-none focus:border-blue-500 flex-1 mr-2"
                    placeholder="Job Title"
                  />
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => onEdit(`experience.${index}.duration`, e.target.value)}
                    className="text-sm border-b border-gray-300 focus:outline-none focus:border-blue-500"
                    placeholder="Jan 2020 - Present"
                  />
                </div>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => onEdit(`experience.${index}.company`, e.target.value)}
                  className="italic text-sm mb-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                  placeholder="Company Name"
                />
                <textarea
                  value={exp.description}
                  onChange={(e) => onEdit(`experience.${index}.description`, e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Key responsibilities and achievements..."
                />
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="font-semibold">{exp.position}</span>
                  <span className="text-sm">{exp.duration}</span>
                </div>
                <p className="italic text-sm mb-1">{exp.company}</p>
                <p className="text-sm">{exp.description}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wide mb-3">Education</h2>
        {data.education.map((edu, index) => (
          <div key={edu.id} className="mb-3">
            {isEditing ? (
              <>
                <div className="flex justify-between mb-1">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => onEdit(`education.${index}.degree`, e.target.value)}
                    className="font-semibold border-b border-gray-300 focus:outline-none focus:border-blue-500 flex-1 mr-2"
                    placeholder="Degree Name"
                  />
                  <input
                    type="text"
                    value={edu.duration}
                    onChange={(e) => onEdit(`education.${index}.duration`, e.target.value)}
                    className="text-sm border-b border-gray-300 focus:outline-none focus:border-blue-500"
                    placeholder="2016 - 2020"
                  />
                </div>
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => onEdit(`education.${index}.school`, e.target.value)}
                  className="italic text-sm border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                  placeholder="University Name"
                />
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="font-semibold">{edu.degree}</span>
                  <span className="text-sm">{edu.duration}</span>
                </div>
                <p className="italic text-sm">{edu.school}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wide mb-3">Skills</h2>
        {isEditing ? (
          <input
            type="text"
            value={data.skills.join(', ')}
            onChange={(e) => onEdit('skills', e.target.value.split(', '))}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
            placeholder="Skill 1, Skill 2, Skill 3, ..."
          />
        ) : (
          <p className="text-sm">{data.skills.join(' • ')}</p>
        )}
      </div>
    </div>
  );
}
