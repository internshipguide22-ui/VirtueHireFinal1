import { User, Briefcase, GraduationCap, Code, FileText, Plus, Trash2 } from 'lucide-react';

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
  onAddExperience: () => void;
  onRemoveExperience: (id: string) => void;
  onAddEducation: () => void;
  onRemoveEducation: (id: string) => void;
}

export function EditPanel({ data, onEdit, onAddExperience, onRemoveExperience, onAddEducation, onRemoveEducation }: Props) {
  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-6 space-y-8">
        {/* Personal Info Section */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-600">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={data.personalInfo.name}
                onChange={(e) => onEdit('personalInfo.name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
              <input
                type="text"
                value={data.personalInfo.title}
                onChange={(e) => onEdit('personalInfo.title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Senior Software Engineer"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={data.personalInfo.email}
                  onChange={(e) => onEdit('personalInfo.email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="john@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={data.personalInfo.phone}
                  onChange={(e) => onEdit('personalInfo.phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={data.personalInfo.location}
                  onChange={(e) => onEdit('personalInfo.location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="San Francisco, CA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="text"
                  value={data.personalInfo.linkedin}
                  onChange={(e) => onEdit('personalInfo.linkedin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-600">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Professional Summary</h2>
          </div>
          <textarea
            value={data.summary}
            onChange={(e) => onEdit('summary', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            rows={5}
            placeholder="Write a compelling summary of your professional background and career goals..."
          />
        </div>

        {/* Experience Section */}
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-blue-600">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Work Experience</h2>
            </div>
            <button
              onClick={onAddExperience}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={exp.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative group">
                <button
                  onClick={() => onRemoveExperience(exp.id)}
                  className="absolute top-2 right-2 p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => onEdit(`experience.${index}.position`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Senior Software Engineer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => onEdit(`experience.${index}.company`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Tech Corp"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => onEdit(`experience.${index}.duration`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Jan 2020 - Present"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => onEdit(`experience.${index}.description`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows={3}
                      placeholder="Describe your key responsibilities and achievements..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-blue-600">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Education</h2>
            </div>
            <button
              onClick={onAddEducation}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={edu.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative group">
                <button
                  onClick={() => onRemoveEducation(edu.id)}
                  className="absolute top-2 right-2 p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => onEdit(`education.${index}.degree`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Bachelor of Science in Computer Science"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">School</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => onEdit(`education.${index}.school`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="University Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                      <input
                        type="text"
                        value={edu.duration}
                        onChange={(e) => onEdit(`education.${index}.duration`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="2016 - 2020"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-600">
            <Code className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Skills</h2>
          </div>
          <div className="space-y-2">
            <textarea
              value={data.skills.join(', ')}
              onChange={(e) => onEdit('skills', e.target.value.split(', ').filter(s => s.trim()))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={4}
              placeholder="JavaScript, React, Node.js, Python, AWS..."
            />
            <p className="text-xs text-gray-500">Separate skills with commas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
