import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  MapPin,
  IndianRupee,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { candidateApi, jobsApi, interviewsApi } from '../../services/api';
import { Job, Application, Interview } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [apps, inters, jobsData] = await Promise.all([
          candidateApi.getApplications(),
          interviewsApi.list(),
          jobsApi.listJobs({ page_size: 4 }),
        ]);
        setApplications(apps);
        setInterviews(inters);
        setRecommendedJobs(jobsData.items);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const calculateProfileCompletion = () => {
    let score = 20;
    if (user?.skills && user.skills.length > 0) score += 30;
    if (user?.experience_years && user.experience_years > 0) score += 15;
    if (user?.education && user.education.length > 0) score += 15;
    if (user?.resume_path) score += 20;
    return Math.min(100, score);
  };

  const profileScore = calculateProfileCompletion();
  const shortlistedCount = applications.filter((a) =>
    ['shortlisted', 'interview', 'accepted'].includes(a.status)
  ).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={4} height="h-28" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-950/10">
        <div className="relative z-10 max-w-2xl">
          
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-indigo-100/90 text-sm sm:text-base leading-relaxed">
            Your ATS profile is actively matched against real-time engineering openings. Review your application statuses, upcoming interviews, or craft your next Career Roadmap.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/candidate/jobs"
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Discover Open Roles
            </Link>
            <Link
              to="/candidate/roadmap"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors border border-white/20 backdrop-blur-sm flex items-center gap-2"
            >
              Generate Career Roadmap
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Profile Strength */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile Strength</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{profileScore}%</span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${profileScore}%` }}
              />
            </div>
            <Link to="/candidate/profile" className="mt-3 text-xs text-indigo-600 font-medium hover:underline inline-flex items-center gap-1">
              Complete profile <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Total Applied */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Applied Roles</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{applications.length}</span>
            <p className="text-xs text-slate-400 mt-1">Submitted applications</p>
          </div>
        </div>

        {/* Shortlisted */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shortlisted</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{shortlistedCount}</span>
            <p className="text-xs text-slate-400 mt-1">Advanced to review</p>
          </div>
        </div>

        {/* Scheduled Interviews */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interviews</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{interviews.length}</span>
            <p className="text-xs text-slate-400 mt-1">Upcoming conversations</p>
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Interviews & Recommended Openings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recommended Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recommended Positions</h2>
              <p className="text-xs text-slate-500">Curated opportunities matching your technical skills</p>
            </div>
            <Link
              to="/candidate/jobs"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                No active jobs available right now. Check back soon!
              </div>
            ) : (
              recommendedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        <Link to={`/candidate/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{job.company_name}</p>
                    </div>
                    <Badge variant="primary" size="sm">
                      {job.work_mode}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    {job.salary_max && (
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                        {job.salary_min ? `${job.salary_min} - ${job.salary_max} LPA` : `${job.salary_max} LPA`}
                      </span>
                    )}
                    <span className="ml-auto">
                      <Link
                        to={`/candidate/jobs/${job.id}`}
                        className="text-indigo-600 font-semibold "
                      >
                        Apply Now 
                      </Link>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Interviews */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-600" />
                Scheduled Interviews
              </h3>
              <span className="text-xs text-slate-400">{interviews.length} total</span>
            </div>

            <div className="mt-4 space-y-3">
              {interviews.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No upcoming interviews scheduled yet.
                </p>
              ) : (
                interviews.map((inter) => (
                  <div key={inter.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>{inter.job?.title || 'Technical Interview'}</span>
                      <Badge variant="info" size="sm">{inter.interview_type}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 mt-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{inter.scheduled_date} at {inter.scheduled_time}</span>
                    </div>
                    {inter.meeting_link && (
                      <a
                        href={inter.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2.5 inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Join Meeting Link
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {!user?.resume_path && (
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-5 border border-indigo-100 text-left">
              <h4 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Upload Your Resume
              </h4>
              <p className="text-xs text-indigo-900/80 mt-1 leading-relaxed">
                Extract your technical skills and experience automatically with Google Gemini AI to unlock instant ATS scoring.
              </p>
              <Link
                to="/candidate/profile"
                className="mt-3 inline-block px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Upload Resume
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

