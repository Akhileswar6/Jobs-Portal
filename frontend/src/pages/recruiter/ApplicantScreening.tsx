import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users2,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  Mail,
  MapPin,
  Clock,
  ArrowLeft,
  Sparkles,
  Download,
  Filter,
  Check,
  X,
  ExternalLink,
  Linkedin,
  Github,
  Globe,
} from 'lucide-react';
import { recruiterApi, applicationsApi, interviewsApi, jobsApi, resumeApi } from '../../services/api';
import { Application, Job } from '../../types';
import { Badge, MatchScoreBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { toast } from 'sonner';

export const ApplicantScreening: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');

  // Candidate detail drawer modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Interview Schedule Modal
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewApp, setInterviewApp] = useState<Application | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/xyz-abc-def');
  const [interviewType, setInterviewType] = useState('technical');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const fetchApplicants = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const [jobData, apps] = await Promise.all([
        jobsApi.getJob(jobId),
        recruiterApi.getJobApplicants(jobId, sortBy),
      ]);
      setJob(jobData);
      setApplications(apps);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load job applicants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId, sortBy]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await applicationsApi.updateStatus(appId, newStatus);
      toast.success(`Application updated to ${newStatus.toUpperCase()}`);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus as any } : a))
      );
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus as any });
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const openInterviewModal = (app: Application) => {
    setInterviewApp(app);
    // Default tomorrow date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().split('T')[0]);
    setIsInterviewModalOpen(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewApp) return;

    setScheduling(true);
    try {
      await interviewsApi.schedule({
        application_id: interviewApp.id,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        meeting_link: meetingLink,
        interview_type: interviewType,
        notes: interviewNotes,
      });
      toast.success('Interview scheduled and invitation notification dispatched!');
      setIsInterviewModalOpen(false);
      fetchApplicants();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to schedule interview.');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Job Postings
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Applicant Screening: {job?.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Deterministic ATS qualification ranking based on 60% Skills + 20% Experience + 20% Keyword alignment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="score">Highest ATS Match Score</option>
              <option value="date">Most Recent First</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Users2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No applicants yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            As candidates discover and apply to this opening, their ATS-ranked profiles will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const candidate = app.candidate;
            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-violet-200 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-bold text-slate-900">
                      {candidate?.name || 'Candidate'}
                    </h3>
                    <MatchScoreBadge score={app.match_score} />
                    <Badge variant={app.status === 'shortlisted' ? 'success' : app.status === 'rejected' ? 'danger' : 'primary'} size="sm">
                      {app.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {candidate?.email}
                    </span>
                    {candidate?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {candidate.location}
                      </span>
                    )}
                    <span>Experience: {candidate?.experience_years || 0} years</span>
                  </div>

                  {/* Skills breakdown */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-emerald-700 font-semibold mr-1">Matched:</span>
                      {app.matched_skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>

                    {app.missing_skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-rose-700 font-semibold mr-1">Missing:</span>
                        {app.missing_skills.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recruiter Action Controls */}
                <div className="flex flex-wrap items-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Profile
                  </button>

                  <button
                    onClick={() => openInterviewModal(app)}
                    className="px-3.5 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                  </button>

                  {/* Status Dropdown */}
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview">Interviewing</option>
                    <option value="accepted">Accepted / Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Profile Details Modal */}
      <Modal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title="Candidate Profile & ATS Breakdown"
        maxWidth="max-w-3xl"
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedApp.candidate?.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedApp.candidate?.email}</p>
                <p className="text-xs text-slate-400 mt-0.5">{selectedApp.candidate?.phone || 'No phone listed'}</p>
                {selectedApp.candidate?.location && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-500" /> {selectedApp.candidate.location}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {selectedApp.candidate?.linkedin_url && (
                    <a
                      href={selectedApp.candidate.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                      <Linkedin className="w-3 h-3" /> LinkedIn
                    </a>
                  )}
                  {selectedApp.candidate?.github_url && (
                    <a
                      href={selectedApp.candidate.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition-colors"
                    >
                      <Github className="w-3 h-3" /> GitHub
                    </a>
                  )}
                  {selectedApp.candidate?.portfolio_url && (
                    <a
                      href={selectedApp.candidate.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      <Globe className="w-3 h-3" /> Portfolio
                    </a>
                  )}
                </div>
              </div>

              <div className="text-right">
                <MatchScoreBadge score={selectedApp.match_score} />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Applied {new Date(selectedApp.applied_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Score Breakdown breakdown */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Skill Fit (60%)</span>
                <span className="text-lg font-bold text-slate-800">{selectedApp.match_breakdown?.skill_score || 0}%</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Experience (20%)</span>
                <span className="text-lg font-bold text-slate-800">{selectedApp.match_breakdown?.experience_score || 0}%</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Relevance (20%)</span>
                <span className="text-lg font-bold text-slate-800">{selectedApp.match_breakdown?.relevance_score || 0}%</span>
              </div>
            </div>

            {selectedApp.match_breakdown?.explanation && (
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-950 leading-relaxed">
                <span className="font-semibold block mb-1">ATS Evaluation Note:</span>
                {selectedApp.match_breakdown.explanation}
              </div>
            )}

            {/* Skills */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Candidate Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedApp.candidate?.skills || []).map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Resume Download action */}
            {selectedApp.candidate?.id && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Resume on disk snapshot:</span>
                <a
                  href={resumeApi.getDownloadUrl(selectedApp.candidate.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download Candidate Resume
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title="Schedule Candidate Interview"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Scheduling an interview will advance the candidate's status to <strong>'Interviewing'</strong> and send them an in-app notification with the meeting details.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Candidate</label>
            <input
              type="text"
              disabled
              value={`${interviewApp?.candidate?.name} (${interviewApp?.candidate?.email})`}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-xs cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time *</label>
              <input
                type="time"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Interview Round</label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="technical">Technical Architecture Round</option>
              <option value="hr">HR & Culture Fit Screening</option>
              <option value="managerial">Engineering Manager Interview</option>
              <option value="screening">Initial Recruiter Screen</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Link (Google Meet / Zoom)</label>
            <input
              type="url"
              required
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Instructions</label>
            <textarea
              rows={2}
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="Prepare for system design discussion on scalable microservices..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsInterviewModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={scheduling}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {scheduling ? 'Scheduling...' : 'Confirm & Send Invite'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

