import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  Calendar,
  CheckCircle2,
  XCircle,
  Bookmark,
  Share2,
  ArrowLeft,
  Sparkles,
  Send,
  HelpCircle,
} from 'lucide-react';
import { jobsApi, applicationsApi, candidateApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Job, Application } from '../../types';
import { Badge, MatchScoreBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { toast } from 'sonner';

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [existingApp, setExistingApp] = useState<Application | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchJobData = async () => {
      try {
        const [jobData, apps, saved] = await Promise.all([
          jobsApi.getJob(id),
          candidateApi.getApplications(),
          candidateApi.getSavedJobs(),
        ]);
        setJob(jobData);
        const currentApp = apps.find((a) => a.job_id === id);
        if (currentApp) {
          setIsApplied(true);
          setExistingApp(currentApp);
        }
        setIsSaved(saved.some((s) => s.id === id));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    fetchJobData();
  }, [id]);

  const handleApply = async () => {
    if (!job) return;
    setApplying(true);
    try {
      const app = await applicationsApi.apply(job.id);
      setIsApplied(true);
      setExistingApp(app);
      toast.success(`Application submitted! Your ATS Match Score is ${app.match_score}%.`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  const handleToggleSave = async () => {
    if (!job) return;
    try {
      if (isSaved) {
        await candidateApi.unsaveJob(job.id);
        setIsSaved(false);
        toast.info('Removed from bookmarks');
      } else {
        await candidateApi.saveJob(job.id);
        setIsSaved(true);
        toast.success('Job bookmarked');
      }
    } catch (e) {
      toast.error('Failed to update bookmark');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton rows={5} height="h-24" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-800">Job not found</h2>
        <Link to="/candidate/jobs" className="text-indigo-600 font-medium text-sm mt-2 inline-block">
          ← Back to Discovery
        </Link>
      </div>
    );
  }

  // Calculate live client match preview if not yet applied
  const candidateSkills = (user?.skills || []).map((s) => s.toLowerCase());
  const matchedSkills = job.required_skills.filter((s) => candidateSkills.includes(s.toLowerCase()));
  const missingSkills = job.required_skills.filter((s) => !candidateSkills.includes(s.toLowerCase()));
  const previewMatchRatio = job.required_skills.length > 0
    ? Math.round((matchedSkills.length / job.required_skills.length) * 100)
    : 80;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Back link */}
      <div>
        <Link
          to="/candidate/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to open roles
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{job.work_mode}</Badge>
              <Badge variant="neutral">{job.job_type}</Badge>
            </div>
            <h1 className="text-2xl sm:text-2xl font-semibold text-slate-900">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pt-1">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Building2 className="w-4 h-4 text-slate-400" />
                {job.company_name}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {job.location}
              </span>
              {job.salary_max && (
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <IndianRupee className="w-4 h-4" />
                  {job.salary_min ? `${job.salary_min} - ${job.salary_max} LPA` : `${job.salary_max} LPA`}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSave}
              className={`p-3 rounded-2xl border transition-all ${
                isSaved ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Remove from bookmarks' : 'Bookmark job'}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            {isApplied ? (
              <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Applied ({existingApp?.status.toUpperCase()})
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className="px-5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm  transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {applying ? 'Evaluating & Applying...' : 'Apply Now'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ATS Match Breakdown Card */}
      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            
            <div>
              <h3 className="font-bold text-base text-white">ATS Deterministic Qualification Engine</h3>
              <p className="text-xs text-indigo-200/70">Formula: 60% Skills + 20% Experience + 20% Keyword Relevance</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xl font-extrabold text-indigo-400">
              {existingApp ? `${existingApp.match_score}%` : `${previewMatchRatio}%`}
            </span>
            <span className="text-[11px] text-indigo-200 block uppercase tracking-wider font-semibold">
              {existingApp ? 'Verified Score' : 'Estimated Match'}
            </span>
          </div>
        </div>

        {/* Skills Matched / Missing breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              Matched Skills ({matchedSkills.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.length === 0 ? (
                <span className="text-xs text-slate-400">No overlapping skills yet.</span>
              ) : (
                matchedSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              <XCircle className="w-4 h-4" />
              Missing Skills ({missingSkills.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.length === 0 ? (
                <span className="text-xs text-emerald-300">All required skills matched!</span>
              ) : (
                missingSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {existingApp?.match_breakdown?.explanation && (
          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-indigo-100/80 leading-relaxed">
            <span className="font-semibold text-white block mb-0.5">Matching Assessment:</span>
            {existingApp.match_breakdown.explanation}
          </div>
        )}
      </div>

      {/* Job Description & Requirements */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-3">About the Role</h2>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {job.description}
          </div>
        </div>

        {job.responsibilities && (
          <div className="pt-6 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Key Responsibilities</h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.responsibilities}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.required_skills.map((s) => (
                <span key={s} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Preferred Qualifications</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.preferred_skills.map((s) => (
                <span key={s} className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

