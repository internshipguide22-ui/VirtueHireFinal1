import { useState } from 'react';
import { Download, Eye, Sparkles, Layout, ChevronLeft, ChevronRight } from 'lucide-react';
import { ClassicProfessional } from './components/ClassicProfessional';
import { ModernMinimal } from './components/ModernMinimal';
import { TwoColumnExecutive } from './components/TwoColumnExecutive';
import { CleanStructured } from './components/CleanStructured';
import { SimpleElegant } from './components/SimpleElegant';
import { EditPanel } from './components/EditPanel';
import { TemplatePreview } from './components/TemplatePreview';

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

const defaultData: ResumeData = {
  personalInfo: {
    name: 'John Doe',
    title: 'Senior Software Engineer',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/johndoe'
  },
  summary: 'Results-driven software engineer with 8+ years of experience designing and implementing scalable web applications. Proven track record of leading cross-functional teams and delivering high-quality solutions that drive business growth.',
  experience: [
    {
      id: '1',
      company: 'Tech Solutions Inc.',
      position: 'Senior Software Engineer',
      duration: 'Jan 2020 - Present',
      description: 'Led development of microservices architecture serving 2M+ users. Mentored team of 5 junior developers and improved deployment efficiency by 40%.'
    },
    {
      id: '2',
      company: 'Digital Innovations Corp.',
      position: 'Software Engineer',
      duration: 'Jun 2016 - Dec 2019',
      description: 'Built RESTful APIs and responsive web applications using React and Node.js. Reduced page load times by 60% through performance optimization.'
    }
  ],
  education: [
    {
      id: '1',
      school: 'University of California',
      degree: 'Bachelor of Science in Computer Science',
      duration: '2012 - 2016'
    }
  ],
  skills: [
    'JavaScript/TypeScript',
    'React & Node.js',
    'Python',
    'AWS & Docker',
    'GraphQL',
    'Agile/Scrum',
    'System Design',
    'Team Leadership'
  ]
};

const templates = [
  { id: 'classic', name: 'Classic Professional', description: 'Traditional format with clean lines', component: ClassicProfessional },
  { id: 'modern', name: 'Modern Minimal', description: 'Sleek and contemporary design', component: ModernMinimal },
  { id: 'executive', name: 'Two-Column Executive', description: 'Professional sidebar layout', component: TwoColumnExecutive },
  { id: 'structured', name: 'Clean Structured', description: 'Organized with color accents', component: CleanStructured },
  { id: 'elegant', name: 'Simple Elegant', description: 'Centered and refined style', component: SimpleElegant }
];

export default function App() {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData>(defaultData);
  const [showEditor, setShowEditor] = useState(true);
  const [view, setView] = useState<'edit' | 'templates'>('edit');

  const handleEdit = (field: string, value: any) => {
    const keys = field.split('.');

    if (keys.length === 2 && keys[0] === 'personalInfo') {
      setResumeData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [keys[1]]: value
        }
      }));
    } else if (keys.length === 3 && (keys[0] === 'experience' || keys[0] === 'education')) {
      const index = parseInt(keys[1]);
      const itemField = keys[2];
      setResumeData(prev => ({
        ...prev,
        [keys[0]]: prev[keys[0] as 'experience' | 'education'].map((item, i) =>
          i === index ? { ...item, [itemField]: value } : item
        )
      }));
    } else if (field === 'summary') {
      setResumeData(prev => ({ ...prev, summary: value }));
    } else if (field === 'skills') {
      setResumeData(prev => ({ ...prev, skills: value }));
    }
  };

  const handleAddExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Date.now().toString(),
          company: '',
          position: '',
          duration: '',
          description: ''
        }
      ]
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const handleAddEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now().toString(),
          school: '',
          degree: '',
          duration: ''
        }
      ]
    }));
  };

  const handleRemoveEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const TemplateComponent = templates[selectedTemplate].component;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Resume Builder Pro
                </h1>
                <p className="text-xs text-gray-500">ATS-Optimized Templates</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setView(view === 'edit' ? 'templates' : 'edit')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
              >
                <Layout className="w-4 h-4" />
                <span>{view === 'edit' ? 'Choose Template' : 'Edit Resume'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 hover:shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'templates' ? (
          <div className="h-full overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Template</h2>
                <p className="text-gray-600">Select from 5 professionally designed, ATS-friendly resume templates</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template, index) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(index);
                      setView('edit');
                    }}
                    className={`group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left border-2 ${
                      selectedTemplate === index
                        ? 'border-blue-600 ring-4 ring-blue-100'
                        : 'border-transparent hover:border-blue-300'
                    }`}
                  >
                    {selectedTemplate === index && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    <div className="aspect-[8.5/11] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 overflow-hidden border border-gray-200">
                      <TemplatePreview templateId={template.id} />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>

                    <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Select Template</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full">
            {/* Editor Sidebar */}
            <div
              className={`transition-all duration-300 border-r border-gray-200 bg-white ${
                showEditor ? 'w-96' : 'w-0'
              } overflow-hidden`}
            >
              <EditPanel
                data={resumeData}
                onEdit={handleEdit}
                onAddExperience={handleAddExperience}
                onRemoveExperience={handleRemoveExperience}
                onAddEducation={handleAddEducation}
                onRemoveEducation={handleRemoveEducation}
              />
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => setShowEditor(!showEditor)}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-r-lg p-2 shadow-lg hover:bg-gray-50 transition-all z-10"
              style={{ left: showEditor ? '384px' : '0px' }}
            >
              {showEditor ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            {/* Resume Preview */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
              <div className="max-w-5xl mx-auto">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>Preview Mode - {templates[selectedTemplate].name}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    ATS Optimized
                  </div>
                </div>

                <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                  <TemplateComponent
                    data={resumeData}
                    onEdit={handleEdit}
                    isEditing={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}