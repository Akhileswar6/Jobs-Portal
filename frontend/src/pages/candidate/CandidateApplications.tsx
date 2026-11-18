import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Calendar,
  Building2,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { candidateApi } from '../../services/api';
import { Application } from '../../types';
import { Badge, MatchScoreBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const CandidateApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await candidateApi.getApplications();
        setApplications(data);
      } catch (err) {
        console.error('Failed to load applications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'shortlisted':
        return 'success';
      case 'interview':
        return 'primary';
      case 'reviewed':
        return 'info';
      case 'rejected':
        return 'danger';
      default:
        return 'warning';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton rows={4} height="h-24" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Applications</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track the live evaluation progress and status updates for every position you've applied to.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No applications yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Explore our curated openings and apply with your AI-parsed resume profile.
          </p>
          <Link
            to="/candidate/jobs"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Browse Open Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                    <Link to={`/candidate/jobs/${app.job_id}`}>{app.job?.title || 'Engineering Role'}</Link>
                  </h3>
                  <Badge variant={getStatusBadgeVariant(app.status)} size="sm">
                    {app.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {app.job?.company_name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {app.job?.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Applied {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                </div>

                
              </div>

              {/* Match Score & View button */}
              <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 justify-between md:justify-end">
                <MatchScoreBadge score={app.match_score} />
                <Link
                  to={`/candidate/jobs/${app.job_id}`}
                  className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

