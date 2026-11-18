import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  PlusCircle,
  Briefcase,
  Users2,
  Edit2,
  Trash2,
  Sparkles,
  MapPin,
  IndianRupee,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { jobsApi, aiApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Job } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { toast } from 'sonner';

export const RecruiterJobs: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState(user?.company_name || '');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [workMode, setWorkMode] = useState('Remote');
  const [salaryMin, setSalaryMin] = useState<number | ''>('');
  const [salaryMax, setSalaryMax] = useState<number | ''>('');
  const [experienceRequired, setExperienceRequired] = useState(2);

  // AI Assistant State
  const [rawJdInput, setRawJdInput] = useState('');
  const [analyzingWithAI, setAnalyzingWithAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchRecruiterJobs = async () => {
    setLoading(true);
    try {
      const myJobs = await jobsApi.getMyJobs();
      setJobs(myJobs);
    } catch (err) {
      try {
        const res = await jobsApi.listJobs({ page_size: 50, include_inactive: true });
        const myJobs = res.items.filter((j) => !user?.id || j.recruiter_id === user?.id);
        setJobs(myJobs);
      } catch (fallbackErr) {
        console.error(fallbackErr);
        toast.error('Failed to load job postings.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterJobs();
    if (searchParams.get('action') === 'create') {
      openCreateModal();
    }
  }, [user]);

  const openCreateModal = () => {
    setEditingJobId(null);
    setTitle('');
    setCompanyName(user?.company_name || '');
    setDescription('');
    setResponsibilities('');
    setRequiredSkills('');
    setPreferredSkills('');
    setLocation('San Francisco, CA');
    setJobType('Full-time');
    setWorkMode('Remote');
    setSalaryMin(4);
    setSalaryMax(8);
    setExperienceRequired(2);
    setRawJdInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJobId(job.id);
    setTitle(job.title);
    setCompanyName(job.company_name);
    setDescription(job.description);
    setResponsibilities(job.responsibilities || '');
    setRequiredSkills(job.required_skills.join(', '));
    setPreferredSkills(job.preferred_skills.join(', '));
    setLocation(job.location);
    setJobType(job.job_type);
    setWorkMode(job.work_mode);
    setSalaryMin(job.salary_min || '');
    setSalaryMax(job.salary_max || '');
    setExperienceRequired(job.experience_required);
    setIsModalOpen(true);
  };

  const handleAiAutoFill = async () => {
    if (!rawJdInput.trim()) {
      toast.error('Please paste a job description draft first.');
      return;
    }
    setAnalyzingWithAI(true);
    try {
      const parsed = await aiApi.analyzeJobDescription(rawJdInput);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.required_skills) setRequiredSkills(parsed.required_skills.join(', '));
      if (parsed.preferred_skills) setPreferredSkills(parsed.preferred_skills.join(', '));
      if (parsed.experience_years_required) setExperienceRequired(parsed.experience_years_required);
      if (parsed.responsibilities) setResponsibilities(parsed.responsibilities.join('\n'));
      if (parsed.summary) setDescription(parsed.summary);
      toast.success('Gemini AI successfully extracted skills and requirements!');
    } catch (e) {
      toast.error('AI analysis failed. Please fill manually.');
    } finally {
      setAnalyzingWithAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload: Partial<Job> = {
      title,
      company_name: companyName,
      description,
      responsibilities,
      required_skills: requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      preferred_skills: preferredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      location,
      job_type: jobType,
      work_mode: workMode,
      salary_min: salaryMin ? Number(salaryMin) : undefined,
      salary_max: salaryMax ? Number(salaryMax) : undefined,
      experience_required: Number(experienceRequired),
    };

    try {
      if (editingJobId) {
        await jobsApi.updateJob(editingJobId, payload);
        toast.success('Job posting updated! Applications match scores recalculated.');
      } else {
        await jobsApi.createJob(payload);
        toast.success('New job posted successfully!');
      }
      setIsModalOpen(false);
      fetchRecruiterJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate and delete this job posting?')) return;
    try {
      await jobsApi.deleteJob(id);
      toast.info('Job deleted.');
      fetchRecruiterJobs();
    } catch (err) {
      toast.error('Failed to delete job.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Job Postings Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, update, and screen applicants for your company's open opportunities.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-sm transition-all shadow-violet-200"
        >
          <PlusCircle className="w-4 h-4" /> Post New Job
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Jobs Posted Yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Create your first posting to start receiving ATS-ranked candidate applications.
          </p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-xs hover:bg-violet-700 transition-colors shadow-sm"
          >
            Post Your First Role
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                  <Badge variant={job.is_active ? 'success' : 'neutral'} size="sm">
                    {job.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                  <Badge variant="primary" size="sm">{job.work_mode}</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  {job.salary_max && (
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                      {job.salary_min ? `${job.salary_min} - ${job.salary_max} LPA` : `${job.salary_max} LPA`}
                    </span>
                  )}
                  <span>Req. Experience: {job.experience_required} yrs</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.required_skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <Link
                  to={`/recruiter/jobs/${job.id}/applicants`}
                  className="px-4 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Users2 className="w-3.5 h-3.5" />
                  Screen Applicants ({job.applications_count || 0})
                </Link>

                <button
                  onClick={() => openEditModal(job)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                  title="Edit Job"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Job Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJobId ? 'Edit Job Posting' : 'Create New Job Opening'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gemini AI Assistant Drawer */}
          {!editingJobId && (
            <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  AI Job Description Parser (Google Gemini)
                </span>
                <span className="text-[11px] text-violet-600">Auto-Extract Requirements</span>
              </div>
              <textarea
                rows={2}
                value={rawJdInput}
                onChange={(e) => setRawJdInput(e.target.value)}
                placeholder="Paste raw JD draft or bullet points here to autofill title, skills, and experience with Gemini AI..."
                className="w-full p-2.5 rounded-xl border border-violet-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
              <button
                type="button"
                onClick={handleAiAutoFill}
                disabled={analyzingWithAI}
                className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {analyzingWithAI ? 'Extracting with Gemini...' : 'Autofill with AI'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA or Remote"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Experience Required (Years)</label>
              <input
                type="number"
                min="0"
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Salary (LPA)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 4 (for 4 LPA)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Salary (LPA)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 8 (for 8 LPA)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills (Comma-separated) *</label>
            <input
              type="text"
              required
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="React, TypeScript, FastAPI, PostgreSQL"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Skills (Comma-separated)</label>
            <input
              type="text"
              value={preferredSkills}
              onChange={(e) => setPreferredSkills(e.target.value)}
              placeholder="Docker, Kubernetes, AWS, GraphQL"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Description *</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide an overview of the mission, team, and scope..."
              className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Responsibilities</label>
            <textarea
              rows={3}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              placeholder="Core tasks, team deliverables, and technical expectations..."
              className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingJobId ? 'Update Posting' : 'Publish Job'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

