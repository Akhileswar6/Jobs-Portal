import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircle,
  UploadCloud,
  FileText,
  Plus,
  X,
  Save,
  CheckCircle2,
  Cpu,
  ScanLine,
  Loader2,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { candidateApi } from '../../services/api';
import { toast } from 'sonner';

export const CandidateProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [experienceYears, setExperienceYears] = useState(user?.experience_years || 0);
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');

  const [uploading, setUploading] = useState(false);
  const [scanStep, setScanStep] = useState(1);
  const [scanProgress, setScanProgress] = useState(10);
  const [saving, setSaving] = useState(false);

  // Sync state if user changes in auth context
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setExperienceYears(user.experience_years || 0);
      setSkills(user.skills || []);
    }
  }, [user]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const clean = newSkill.trim();
    if (!skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setSkills([...skills, clean]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setScanStep(1);
    setScanProgress(15);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev < 35) {
          setScanStep(2);
          return prev + 6;
        } else if (prev < 68) {
          setScanStep(3);
          return prev + 4;
        } else if (prev < 90) {
          setScanStep(4);
          return prev + 2;
        }
        return prev;
      });
    }, 400);

    try {
      const res = await candidateApi.uploadResume(file);
      clearInterval(interval);
      setScanProgress(100);
      setScanStep(4);

      setTimeout(async () => {
        toast.success('Resume parsed and skills extracted by Gemini AI!');
        await refreshUser();
        if (res.parsed_data?.technical_skills) {
          setSkills(res.parsed_data.technical_skills);
        }
        if (res.parsed_data?.total_experience_years) {
          setExperienceYears(res.parsed_data.total_experience_years);
        }
        setUploading(false);
      }, 700);
    } catch (err: any) {
      clearInterval(interval);
      setUploading(false);
      toast.error(err.response?.data?.detail || 'Failed to upload and parse resume.');
    } finally {
      // Clear input so user can re-upload same file if desired
      e.target.value = '';
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await candidateApi.updateProfile({
        name,
        phone,
        location,
        experience_years: Number(experienceYears),
        skills,
      });
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const scanSteps = [
    { id: 1, label: 'Document Validation', desc: 'Verifying PDF/DOCX structure & MIME headers' },
    { id: 2, label: 'Text Extraction', desc: 'Running PDFPlumber layout & section analysis' },
    { id: 3, label: 'Gemini AI Analysis', desc: 'Neural parsing of skills, projects & achievements' },
    { id: 4, label: 'ATS Skill Indexing', desc: 'Normalizing keywords and syncing candidate profile' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 relative font-sans">
      {/* Scanning HUD Overlay Animation */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 font-sans"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl border border-indigo-100 shadow-2xl max-w-lg w-full p-8 overflow-hidden relative font-sans"
            >
              {/* Animated Background Laser Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Scanning Graphic Container */}
              <div className="text-center space-y-4">
                <div className="relative mx-auto w-24 h-32 rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 flex flex-col items-center justify-center overflow-hidden shadow-inner">
                  {/* Stylized text lines mimicking resume */}
                  <div className="space-y-1.5 w-16 opacity-30">
                    <div className="h-1.5 bg-indigo-700 rounded-full w-full" />
                    <div className="h-1.5 bg-indigo-500 rounded-full w-3/4" />
                    <div className="h-1 bg-indigo-400 rounded-full w-full" />
                    <div className="h-1 bg-indigo-400 rounded-full w-5/6" />
                    <div className="h-1 bg-indigo-300 rounded-full w-2/3" />
                  </div>

                  {/* Vertical Animated Laser Beam */}
                  <motion.div
                    animate={{
                      top: ['0%', '85%', '0%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent shadow-[0_0_12px_rgba(79,70,229,0.8)]"
                  />

                  {/* Laser aura */}
                  <motion.div
                    animate={{
                      opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                    className="absolute inset-0 bg-indigo-400/10 pointer-events-none"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center justify-center gap-2">
                    <ScanLine className="w-5 h-5 text-indigo-600 animate-pulse" />
                    Analyzing Resume with Gemini AI
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Extracting skills, experience, and structuring ATS profile attributes
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-indigo-600">Scan & Analysis</span>
                    <span className="text-slate-700 font-bold">{Math.min(scanProgress, 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5">
                    <motion.div
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 h-full rounded-full transition-all duration-300 shadow-sm"
                      style={{ width: `${Math.min(scanProgress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Step Indicators */}
                <div className="mt-6 space-y-2.5 text-left border-t border-slate-100 pt-4">
                  {scanSteps.map((step) => {
                    const isDone = scanStep > step.id || scanProgress === 100;
                    const isCurrent = scanStep === step.id && scanProgress < 100;

                    return (
                      <div
                        key={step.id}
                        className={`flex items-start gap-3 p-2 rounded-xl transition-colors ${
                          isCurrent ? 'bg-indigo-50/80 border border-indigo-100' : 'bg-transparent'
                        }`}
                      >
                        <div className="mt-0.5">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : isCurrent ? (
                            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-200 bg-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-xs font-bold ${
                              isDone ? 'text-slate-700' : isCurrent ? 'text-indigo-900' : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-[11px] text-slate-400 leading-tight">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Candidate Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Keep your personal details, resume, and skills updated to maximize your ATS match scores.
        </p>
      </div>

      {/* 1. PERSONAL DETAILS (TOP) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-indigo-600" /> Personal Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Austin, TX or Remote"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Total Experience (Years)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* 2. RESUME UPLOAD (SECOND) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">AI Resume Parser (Gemini 2.5)</h2>
            <p className="text-xs text-slate-500">
              Upload PDF or DOCX. Gemini AI will automatically extract your technical skills, summary, and experience.
            </p>
          </div>
        </div>

        <div className="mt-4 border-2 border-dashed border-indigo-200 rounded-2xl p-6 sm:p-8 bg-indigo-50/20 text-center hover:bg-indigo-50/40 transition-colors">
          <input
            type="file"
            id="resume-upload"
            className="hidden"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <span className="font-semibold text-sm text-indigo-900">
              {uploading ? 'Analyzing Resume with Gemini AI...' : 'Click or drag resume file here to analyze'}
            </span>
            <span className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, and TXT (Max 10MB)</span>
          </label>
        </div>

        {user?.resume_path && (
          <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="text-xs font-semibold text-slate-800">Current Resume on file</span>
                <p className="text-[11px] text-slate-400">Parsed & indexed for ATS deterministic matching</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          </div>
        )}
      </div>

      {/* 3. TECHNICAL SKILLS MANAGER (THIRD) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Technical Skills</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            These skills are evaluated directly against recruiter job descriptions in the 60% ATS skill weight formula.
          </p>
        </div>

        {/* Add skill input */}
        <form onSubmit={handleAddSkill} className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a technical skill (e.g. FastAPI, PostgreSQL, React, Docker)"
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>

        {/* Skill badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {skills.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No skills added yet. Upload your resume to autofill skills.</p>
          ) : (
            skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* 4. EXTRACTED RESUME SUMMARY (IF AVAILABLE) */}
      {user?.resume_parsed_data && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" /> Extracted Resume Summary
          </h2>

          {user.resume_parsed_data.summary && (
            <div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Professional Summary
              </span>
              <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                {user.resume_parsed_data.summary}
              </p>
            </div>
          )}

          {user.resume_parsed_data.work_experience?.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Work Experience Extracted
              </span>
              <div className="space-y-2">
                {user.resume_parsed_data.work_experience.map((exp: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex justify-between items-start font-bold text-slate-800">
                      <span>
                        {exp.title} • {exp.company}
                      </span>
                      <span className="text-slate-400 font-normal">
                        {exp.start_date} - {exp.end_date || 'Present'}
                      </span>
                    </div>
                    {exp.description && <p className="text-slate-500 mt-1 line-clamp-2">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. FINALLY: SAVE PROFILE BUTTON (BOTTOM) */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all shadow-indigo-200 disabled:opacity-50"
        >
          <Save className="w-4.5 h-4.5" />
          {saving ? 'Saving Changes...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};
