import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users2,
  CheckCircle2,
  Calendar,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
} from 'recharts';
import { recruiterApi } from '../../services/api';
import { RecruiterDashboardData } from '../../types';
import { MatchScoreBadge, Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const RecruiterDashboard: React.FC = () => {
  const [data, setData] = useState<RecruiterDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await recruiterApi.getDashboardAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load recruiter analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={4} height="h-28" />
      </div>
    );
  }

  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#10b981'];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Recruiter Analytics Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time hiring funnel telemetry, applicant ranking, and in-demand skills analysis.
          </p>
        </div>

        <Link
          to="/recruiter/jobs?action=create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-sm transition-all shadow-violet-200 w-fit"
        >
          <PlusCircle className="w-4 h-4" /> Post New Job
        </Link>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Jobs */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Postings</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{data?.total_jobs || 0}</span>
            <span className="text-xs text-violet-600 font-semibold">{data?.active_jobs || 0} Active</span>
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Applicants</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{data?.total_applications || 0}</span>
            <Users2 className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Shortlisted */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shortlisted</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600">{data?.shortlisted_candidates || 0}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* Interviews */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interviews</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-600">{data?.interviews_scheduled || 0}</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
        </div>

        {/* ATS Filter Ratio */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Screening Yield</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {data?.total_applications
                ? `${Math.round(((data?.shortlisted_candidates || 0) / data.total_applications) * 100)}%`
                : '0%'}
            </span>
            <span className="text-[11px] text-slate-400">Shortlist rate</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hiring Funnel Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hiring Conversion Funnel</h2>
              <p className="text-xs text-slate-500">Candidate flow from application to hire</p>
            </div>
            <Badge variant="info">SQLAlchemy Analytics</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.hiring_funnel || []} layout="vertical" margin={{ left: 20, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Candidates`, 'Count']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {(data?.hiring_funnel || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top In-Demand Skills Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Top Required Tech Skills</h2>
              <p className="text-xs text-slate-500">Most requested competencies across active jobs</p>
            </div>
            <Badge variant="primary">ATS Normalized</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.top_skills || []} margin={{ bottom: 20 }}>
                <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Postings`, 'Frequency']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Applications & ATS Scores</h2>
            <p className="text-xs text-slate-500">Candidates evaluated by deterministic scoring</p>
          </div>
          <Link
            to="/recruiter/jobs"
            className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1"
          >
            Manage all jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4">ATS Match Score</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!data?.recent_applications || data.recent_applications.length === 0) ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No applications received yet.
                  </td>
                </tr>
              ) : (
                data.recent_applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{app.candidate_name}</td>
                    <td className="py-3 px-4 text-slate-600">{app.job_title}</td>
                    <td className="py-3 px-4">
                      <MatchScoreBadge score={app.match_score} />
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={app.status === 'shortlisted' ? 'success' : 'neutral'} size="sm">
                        {app.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

