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
  Eye,
  Download,
  ExternalLink,
  RefreshCw,
  Camera,
  Calendar,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { candidateApi, resumeApi } from '../../services/api';
import { toast } from 'sonner';

export const CandidateProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [experienceYears, setExperienceYears] = useState(user?.experience_years || 0);
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');

  // Extended candidate details
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [preferredLocations, setPreferredLocations] = useState<string[]>(user?.preferred_locations || []);
  const [newLocationInput, setNewLocationInput] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || '');
  const [githubUrl, setGithubUrl] = useState(user?.github_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolio_url || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [scanStep, setScanStep] = useState(1);
  const [scanProgress, setScanProgress] = useState(10);
  const [saving, setSaving] = useState(false);

  const [resumeLoading, setResumeLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const popularLocations = ['Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Chennai', 'Remote'];

  const getCleanResumeName = () => {
    if (!user?.resume_path) return 'Resume Document';
    const raw = user.resume_path.split(/[\\/]/).pop() || 'Resume Document';
    return raw;
  };

  const getPhotoUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://127.0.0.1:8000${url}`;
  };

  const getExperienceBullets = (exp: any): string[] => {
    if (Array.isArray(exp?.responsibilities) && exp.responsibilities.length > 0) {
      return exp.responsibilities;
    }
    if (Array.isArray(exp?.bullet_points) && exp.bullet_points.length > 0) {
      return exp.bullet_points;
    }
    if (typeof exp?.description === 'string' && exp.description.trim()) {
      return exp.description
        .split(/[\r\n]+|[•\u2022\u2023\u25E6\u2043\u2219]+/)
        .map((s: string) => s.trim().replace(/^[-*•\s]+/, ''))
        .filter((s: string) => s.length > 0);
    }
    return [];
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    setUploadingPhoto(true);
    try {
      const res = await candidateApi.uploadPhoto(file);
      setProfileImage(res.profile_image);
      await refreshUser();
      toast.success('Profile photo updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleAddLocation = (locToAdd: string) => {
    const clean = locToAdd.trim();
    if (!clean) return;
    if (!preferredLocations.some((l) => l.toLowerCase() === clean.toLowerCase())) {
      setPreferredLocations([...preferredLocations, clean]);
    }
    setNewLocationInput('');
  };

  const handleRemoveLocation = (locToRemove: string) => {
    setPreferredLocations(preferredLocations.filter((l) => l !== locToRemove));
  };

  const handlePreviewResume = async (openInNewTab = true) => {
    setResumeLoading(true);
    try {
      const blob = await resumeApi.downloadMyResume();
      const url = URL.createObjectURL(blob);
      if (openInNewTab) {
        const win = window.open(url, '_blank');
        if (!win) {
          // If browser popup blocker intercepts, fallback to high-fidelity modal
          setPreviewUrl(url);
          setShowPreviewModal(true);
        } else {
          setTimeout(() => URL.revokeObjectURL(url), 120000);
        }
      } else {
        setPreviewUrl(url);
        setShowPreviewModal(true);
      }
    } catch (err: any) {
      toast.error('Could not load resume document.');
    } finally {
      setResumeLoading(false);
    }
  };

  const handleDownloadResume = async () => {
    setResumeLoading(true);
    try {
      const blob = await resumeApi.downloadMyResume();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getCleanResumeName();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Download started');
    } catch (err: any) {
      toast.error('Failed to download resume');
    } finally {
      setResumeLoading(false);
    }
  };

  // Sync state if user changes in auth context
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setExperienceYears(user.experience_years || 0);
      setSkills(user.skills || []);
      setProfileImage(user.profile_image || '');
      setDateOfBirth(user.date_of_birth || '');
      setGender(user.gender || '');
      setPreferredLocations(user.preferred_locations || []);
      setLinkedinUrl(user.linkedin_url || '');
      setGithubUrl(user.github_url || '');
      setPortfolioUrl(user.portfolio_url || '');
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
        toast.success('Resume analyzed and skills extracted successfully!');
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
        profile_image: profileImage,
        date_of_birth: dateOfBirth,
        gender,
        preferred_locations: preferredLocations,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
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
    { id: 2, label: 'Text Extraction', desc: 'Running PDF layout & section analysis' },
    { id: 3, label: 'Resume Analyzer', desc: 'Deep parsing of skills, projects & achievements' },
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
                    Analyzing Resume...
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
                        className={`flex items-start gap-3 p-2 rounded-xl transition-colors ${isCurrent ? 'bg-indigo-50/80 border border-indigo-100' : 'bg-transparent'
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
                            className={`text-xs font-bold ${isDone ? 'text-slate-700' : isCurrent ? 'text-indigo-900' : 'text-slate-400'
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
        <h1 className="text-2xl font-semibold text-slate-900">Candidate Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Keep your personal details, resume, and skills updated to maximize your ATS match scores.
        </p>
      </div>

      {/* 1. PERSONAL DETAILS (TOP) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-indigo-600" /> Personal Details & Information
          </h2>
          <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
            Candidate Profile
          </span>
        </div>

        {/* Profile Photo Upload Row */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/20 border border-slate-200/80">
          <div className="relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-indigo-100 border-2 border-white shadow-md flex items-center justify-center text-indigo-700 font-bold text-2xl relative">
              {profileImage ? (
                <img
                  src={getPhotoUrl(profileImage)}
                  alt={name || 'Candidate'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span>{(name || user?.name || 'U').charAt(0).toUpperCase()}</span>
              )}

              {uploadingPhoto && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>

            <label
              htmlFor="profile-photo-input"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-md cursor-pointer transition-transform hover:scale-105"
              title="Upload new photo"
            >
              <Camera className="w-4 h-4" />
            </label>
            <input
              type="file"
              id="profile-photo-input"
              className="hidden"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
            />
          </div>

          <div className="text-center sm:text-left flex-1">
            <h3 className="text-sm font-semibold text-slate-800">Profile Photo</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a clear headshot or portrait. Supports PNG, JPG, or WebP (Max 5MB).
            </p>
            <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-2">
              <label
                htmlFor="profile-photo-input"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 shadow-2xs transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                {profileImage ? 'Change Photo' : 'Upload Photo'}
              </label>
              {profileImage && (
                <button
                  type="button"
                  onClick={() => setProfileImage('')}
                  className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Primary Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Gender <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* Total Experience */}
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

          {/* Current Location */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Current Location (City, State, Country)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hyderabad, Telangana, India"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Preferred Job Location (Multi-select) */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Preferred Job Location (Multi-select)
            </label>
          </div>

          {/* Active Preferred Locations */}
          <div className="flex flex-wrap gap-2 min-h-[36px] p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            {preferredLocations.length === 0 ? (
              <span className="text-xs text-slate-400 px-1 py-0.5">
                No preferred locations selected. Pick from quick suggestions below or type custom locations.
              </span>
            ) : (
              preferredLocations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200 shadow-2xs"
                >
                  <MapPin className="w-3 h-3 text-indigo-500" />
                  {loc}
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(loc)}
                    className="hover:text-red-500 transition-colors ml-0.5 cursor-pointer"
                    title={`Remove ${loc}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Add custom location input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newLocationInput}
              onChange={(e) => setNewLocationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLocation(newLocationInput);
                }
              }}
              placeholder="Type city or location (e.g. Pune, Remote)"
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            <button
              type="button"
              onClick={() => handleAddLocation(newLocationInput)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Suggestions:</span>
            {popularLocations.map((popLoc) => {
              const isSelected = preferredLocations.some((l) => l.toLowerCase() === popLoc.toLowerCase());
              return (
                <button
                  key={popLoc}
                  type="button"
                  onClick={() => (isSelected ? handleRemoveLocation(popLoc) : handleAddLocation(popLoc))}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {isSelected ? `✓ ${popLoc}` : `+ ${popLoc}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Social & Professional Links */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Online Profiles & Portfolio
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* LinkedIn */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-blue-600" /> LinkedIn Profile
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-slate-800" /> GitHub Profile
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Portfolio Website */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600" /> Portfolio Website
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://yourportfolio.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. RESUME UPLOAD & ANALYZER (SECOND) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Resume Analyzer & Upload</h2>
            <p className="text-xs text-slate-500">
              Upload PDF or DOCX. AI will automatically extracts your technical skills, summary, and experience.
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
              {uploading ? 'Analyzing Resume...' : 'Click or drag resume file here to upload & analyze'}
            </span>
            <span className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, and TXT (Max 10MB)</span>
          </label>
        </div>

        {/* Uploaded Resume Details Section Downside */}
        {user?.resume_path ? (
          <div className="mt-5 p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl border border-indigo-100 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-xs text-indigo-600 flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800 break-all">
                      {getCleanResumeName()}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Resume
                    </span>
                  </div>
                  
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handlePreviewResume(true)}
                  disabled={resumeLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 shadow-2xs transition-colors cursor-pointer"
                  title="Open resume in clean full tab"
                >
                  {resumeLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  View Resume
                </button>
                <button
                  type="button"
                  onClick={handleDownloadResume}
                  disabled={resumeLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 shadow-2xs transition-colors cursor-pointer"
                  title="Download resume file"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <label
                  htmlFor="resume-upload"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
                  title="Upload a new version to replace current resume"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replace
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>No resume uploaded yet. Upload your resume above to extract skills and enable ATS matching.</span>
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
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
                Work Experience Extracted
              </span>
              <div className="space-y-3">
                {user.resume_parsed_data.work_experience.map((exp: any, idx: number) => {
                  const bullets = getExperienceBullets(exp);
                  return (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-bold text-slate-800 pb-2 border-b border-slate-200/60">
                        <span className="text-sm text-indigo-950 font-bold">
                          {exp.title} • <span className="text-indigo-600">{exp.company}</span>
                        </span>
                        <span className="text-slate-500 font-medium text-[11px] bg-white px-2 py-0.5 rounded-md border border-slate-200 w-fit">
                          {exp.start_date} - {exp.end_date || 'Present'}
                        </span>
                      </div>

                      {/* Bullet points display */}
                      {bullets.length > 0 ? (
                        <ul className="mt-2.5 space-y-2">
                          {bullets.map((bullet: string, bIdx: number) => (
                            <li key={bIdx} className="flex items-start gap-2.5 text-slate-600 leading-relaxed text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                              <span className="flex-1">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : exp.description ? (
                        <p className="text-slate-600 mt-2 leading-relaxed">{exp.description}</p>
                      ) : null}
                    </div>
                  );
                })}
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm  transition-all shadow-indigo-200 disabled:opacity-50"
        >
          {saving ? 'Saving Changes...' : 'Save Profile'}
        </button>
      </div>

      {/* Full-Screen Immersive Resume Document Viewer Modal */}
      <AnimatePresence>
        {showPreviewModal && previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col font-sans"
            style={{ fontFamily: "'Google Sans Flex', -apple-system, BlinkMacSystemFont, sans-serif" }}
          >
            {/* Dark Sleek Top Navigation Bar */}
            <div className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">{getCleanResumeName()}</h3>
                  <p className="text-[11px] text-slate-400">ATS Resume Document Viewer</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.open(previewUrl, '_blank')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                  title="Open in clean full tab"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Open Full Tab</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadResume}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  title="Download PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
                  title="Close viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Full View Container */}
            <div className="flex-1 w-full bg-slate-950 p-2 sm:p-4 flex items-center justify-center overflow-hidden">
              <iframe
                src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                className="w-full h-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-slate-800"
                title="Resume Preview"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
