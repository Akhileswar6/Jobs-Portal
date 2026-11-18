import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Milestone,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  FolderGit2,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { aiApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CareerRoadmap, CareerMilestone } from '../../types';
import { toast } from 'sonner';

const POPULAR_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Python Developer',
  'Cybersecurity Analyst',
  'Cloud Engineer',
  'Data Analyst',
];

export const CareerRoadmapPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState(POPULAR_ROLES[0]);
  const [customRole, setCustomRole] = useState('');
  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState<CareerRoadmap[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await aiApi.getSavedRoadmaps();
        setSavedRoadmaps(history);
        if (history.length > 0) {
          setRoadmap(history[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchHistory();
  }, []);

  const handleGenerateRoadmap = async () => {
    const target = customRole.trim() || selectedRole;
    setGenerating(true);
    try {
      const generated = await aiApi.generateRoadmap({
        target_role: target,
        current_skills: user?.skills || [],
        experience_years: user?.experience_years || 0,
      });
      setRoadmap(generated);
      setSavedRoadmaps((prev) => [generated, ...prev]);
      toast.success(`Generated an ${generated.milestones.length}-milestone AI Career Roadmap!`);
    } catch (err: any) {
      toast.error('Failed to generate roadmap. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        
        <h1 className="text-2xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
          AI Career Roadmap & Skill Gap Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select your target engineering title to generate an 8–12 phase learning curriculum, personalized skill gap analysis, and portfolio project ideas.
        </p>
      </div>

      {/* Target Role Selector Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Choose Your Desired Role:
        </label>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2">
          {POPULAR_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setSelectedRole(role);
                setCustomRole('');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedRole === role && !customRole
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Custom role input */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="text"
            value={customRole}
            onChange={(e) => {
              setCustomRole(e.target.value);
              setSelectedRole('');
            }}
            placeholder="Or type custom role (e.g. AI Engineer, Site Reliability Engineer)..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
          <button
            onClick={handleGenerateRoadmap}
            disabled={generating}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'AI is analyzing...' : 'Generate Roadmap'}
          </button>
        </div>
      </div>

      {/* Roadmap Output */}
      {roadmap && (
        <div className="space-y-8">
          {/* Skill Gap Analysis Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-300">
              <TrendingUp className="w-5 h-5" /> Skill Gap Assessment: {roadmap.target_role}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Current Skills */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Skills You Already Have ({roadmap.current_skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {roadmap.current_skills.length === 0 ? (
                    <span className="text-xs text-slate-400">Add skills in your profile to compare.</span>
                  ) : (
                    roadmap.current_skills.map((s) => (
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

              {/* Missing Skills */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Recommended Skills to Master ({roadmap.missing_skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {roadmap.missing_skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Timeline of 8-12 Milestones */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Step-by-Step Curriculum ({roadmap.milestones.length} Milestones)
                </h3>
                <p className="text-xs text-slate-500">
                  Follow this sequential milestone path to achieve job-readiness for {roadmap.target_role}.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                Sequential Path
              </span>
            </div>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-200 space-y-10 ml-3">
              {roadmap.milestones.map((ms, index) => (
                <div key={index} className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-4 ring-white shadow-sm">
                    {ms.phase}
                  </div>

                  {/* Card Content */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        {ms.title}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full w-fit">
                        <Clock className="w-3.5 h-3.5" /> {ms.timeline}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {ms.description}
                    </p>

                    {/* Key Skills */}
                    {ms.skills_to_learn && ms.skills_to_learn.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-slate-500 mr-1 py-0.5">Skills:</span>
                        {ms.skills_to_learn.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-[11px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Project Suggestion */}
                    {ms.hands_on_project && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 mt-2">
                        <FolderGit2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-900">Portfolio Project: </span>
                          <span>{ms.hands_on_project}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

