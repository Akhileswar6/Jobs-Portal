import React, { useState, useEffect } from 'react';
import {
  Building2,
  Globe,
  Mail,
  Phone,
  Save,
  Linkedin,
  Upload,
  Briefcase,
  Layers,
  Loader2,
  CheckCircle2,
  X,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { recruiterApi } from '../../services/api';
import { toast } from 'sonner';

const INDUSTRIES = [
  'Information Technology & Services',
  'Software Engineering & SaaS',
  'Financial Services & FinTech',
  'Healthcare & HealthTech',
  'E-Commerce & Retail',
  'Education & EdTech',
  'Manufacturing & Industrial',
  'Telecommunications',
  'Media & Entertainment',
  'Consulting & Professional Services',
  'Other',
];

const COMPANY_TYPES = ['Startup', 'MNC', 'Agency', 'Other'];

const DEPARTMENTS = [
  'Human Resources (HR)',
  'Talent Acquisition',
  'Management & Leadership',
  'Engineering & Technology',
  'Operations',
  'Marketing & Growth',
  'Other',
];

const DESIGNATIONS = [
  'HR Manager',
  'Senior Technical Recruiter',
  'Talent Acquisition Lead',
  'Hiring Manager',
  'Recruitment Consultant',
  'Head of People & Culture',
  'Technical Sourcer',
  'VP of Talent',
  'Founder & CEO',
];

export const RecruiterProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();

  // Company Information States
  const [companyName, setCompanyName] = useState(user?.company_name || '');
  const [companyLogo, setCompanyLogo] = useState(user?.company_logo || '');
  const [companyWebsite, setCompanyWebsite] = useState(user?.company_website || '');
  const [companyEmail, setCompanyEmail] = useState(user?.company_email || '');
  const [industry, setIndustry] = useState(user?.industry || '');
  const [companyDescription, setCompanyDescription] = useState(user?.company_description || '');
  const [companyLinkedinUrl, setCompanyLinkedinUrl] = useState(user?.company_linkedin_url || '');
  const [companyType, setCompanyType] = useState(user?.company_type || '');

  // Recruiter Details States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || '');

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync state if user context updates
  useEffect(() => {
    if (user) {
      setCompanyName(user.company_name || '');
      setCompanyLogo(user.company_logo || '');
      setCompanyWebsite(user.company_website || '');
      setCompanyEmail(user.company_email || '');
      setIndustry(user.industry || '');
      setCompanyDescription(user.company_description || '');
      setCompanyLinkedinUrl(user.company_linkedin_url || '');
      setCompanyType(user.company_type || '');
      setName(user.name || '');
      setPhone(user.phone || '');
      setDesignation(user.designation || '');
      setDepartment(user.department || '');
      setLinkedinUrl(user.linkedin_url || '');
    }
  }, [user]);

  const getLogoUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://127.0.0.1:8000${url}`;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP, SVG)');
      return;
    }

    setUploadingLogo(true);
    try {
      const res = await recruiterApi.uploadLogo(file);
      setCompanyLogo(res.company_logo);
      await refreshUser();
      toast.success('Company logo uploaded successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await recruiterApi.updateProfile({
        name,
        phone,
        company_name: companyName,
        company_logo: companyLogo,
        company_website: companyWebsite,
        company_email: companyEmail,
        industry,
        company_description: companyDescription,
        company_linkedin_url: companyLinkedinUrl,
        company_type: companyType,
        designation,
        department,
        linkedin_url: linkedinUrl,
      });
      await refreshUser();
      toast.success('Company & Recruiter profile saved successfully!');
    } catch (err) {
      toast.error('Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 font-sans pb-12">
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">Company & Recruiter Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Every recruiter is associated with an official company profile displayed on job postings and applicant screening.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. COMPANY INFORMATION */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" /> Company Information
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every recruiter should be associated with an authentic company profile.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Employer Profile
            </span>
          </div>

          {/* Company Logo Upload Row */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/20 border border-slate-200/80">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white border-2 border-indigo-100 shadow-sm flex items-center justify-center text-indigo-600 relative p-1.5">
                {companyLogo ? (
                  <img
                    src={getLogoUrl(companyLogo)}
                    alt={companyName || 'Company Logo'}
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-slate-300" />
                )}

                {uploadingLogo && (
                  <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>

              <label
                htmlFor="company-logo-input"
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-md cursor-pointer transition-transform hover:scale-105"
                title="Upload company logo"
              >
                <Upload className="w-3.5 h-3.5" />
              </label>
              <input
                type="file"
                id="company-logo-input"
                className="hidden"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/jpg"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
              />
            </div>

            <div className="text-center sm:text-left flex-1">
              <h3 className="text-sm font-bold text-slate-800">Company Logo</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your company brand logo. Supports PNG, JPG, WebP, or SVG (Max 5MB).
              </p>
              <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-2">
                <label
                  htmlFor="company-logo-input"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 shadow-2xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {companyLogo ? 'Change Logo' : 'Upload Logo'}
                </label>
                {companyLogo && (
                  <button
                    type="button"
                    onClick={() => setCompanyLogo('')}
                    className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Company Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Company Website */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" /> Company Website
              </label>
              <input
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="https://company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Company Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-500" /> Company Email
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="contact@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" /> Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="">Select Industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Company Type
              </label>
              <select
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="">Select Company Type</option>
                {COMPANY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* LinkedIn Company Page */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-blue-600" /> LinkedIn Company Page
              </label>
              <input
                type="url"
                value={companyLinkedinUrl}
                onChange={(e) => setCompanyLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/company/acme"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Company Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Description</label>
            <textarea
              rows={4}
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Describe your company's mission, culture, key products, and work environment..."
              className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        {/* 2. RECRUITER INFORMATION */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" /> Recruiter Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Your verified recruiter identity and contact info displayed to candidates.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              Recruiter Account
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Work Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Work Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-500" /> Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Designation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Designation</label>
              <input
                type="text"
                list="designation-suggestions"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Senior Technical Recruiter"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <datalist id="designation-suggestions">
                {DESIGNATIONS.map((desig) => (
                  <option key={desig} value={desig} />
                ))}
              </datalist>
            </div>

            {/* LinkedIn Profile */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
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
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all  flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

