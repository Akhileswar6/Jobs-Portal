import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Cpu,
  BarChart3,
  ShieldCheck,
  FileCheck2,
  Users,
  Compass,
  Layers,
  ChevronDown,
  Sparkles,
  Search,
  Building,
  Target,
  Zap,
  Lock,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'candidate' | 'recruiter'>('candidate');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, ease: 'easeOut' },
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.12,
      },
    },
    viewport: { once: true },
  };

  const faqs = [
    {
      q: 'How does the 60/20/20 Deterministic ATS Scoring Formula work?',
      a: 'Unlike opaque black-box AI algorithms, Jobs Portal calculates match scores strictly in Python through transparent weighting: 60% normalized technical skill overlap, 20% verified years of industry experience against job requirements, and 20% semantic domain keyword alignment. Candidates and recruiters see exactly how scores are derived.',
    },
    {
      q: 'What formats are supported for resume uploading and parsing?',
      a: 'Jobs Portal supports PDF, DOCX, and plain text files. Uploaded resumes are securely parsed to extract candidate name, contact data, technical skills taxonomy, work history bullet points, and education into structured relational records.',
    },
    {
      q: 'How do recruiters benefit from Jobs Portal over traditional boards?',
      a: 'Recruiters eliminate manual spreadsheet tracking. When applicants apply, they are automatically ranked mathematically by ATS compatibility. Recruiters can view full candidate profiles, review structured resumes, manage custom company branding, and filter applicants in seconds.',
    },
    {
      q: 'What is the Career Upskilling Roadmap feature?',
      a: 'Candidates receive personalized milestone roadmaps built from identified skill gaps between their profile and target roles, outlining recommended frameworks, practical portfolio projects, and key technical concepts to master.',
    },
    {
      q: 'Is candidate and recruiter data securely stored?',
      a: 'Yes. All account credentials are encrypted with bcrypt, sessions are secured via JWT bearer tokens with role-based access controls (RBAC), and relational data is maintained in isolated MySQL database tables.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="font-semibold text-xl text-slate-900 tracking-tight">
              Jobs Portal
            </span>
          </Link>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              How It Works
            </a>
            <a href="#formula" className="hover:text-indigo-600 transition-colors">
              ATS Formula
            </a>
            <a href="#portals" className="hover:text-indigo-600 transition-colors">
              Portals & Roles
            </a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm shadow-indigo-200 flex items-center gap-1.5"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 font-semibold text-sm transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm shadow-indigo-200"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-24 sm:pb-28 lg:pt-28 lg:pb-32 bg-gradient-to-b from-white via-indigo-50/25 to-slate-50 border-b border-slate-200/80">
        {/* Decorative background glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-300/20 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="pt-2 sm:pt-4"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold text-slate-950 tracking-tight max-w-4xl mx-auto leading-[1.18]">
              Precision ATS Matching &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
                Automated Candidate Screening
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-7 sm:mt-8 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Deterministic mathematical scoring meets modern talent discovery. Transparent resume parsing,
            verifiable ATS compatibility percentages, structured career roadmaps, and automated recruiter candidate pipelines.
          </motion.p>

          {/* Dual Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-sm shadow-sm hover:border-slate-300 transition-all cursor-pointer hover:-translate-y-0.5"
            >
              Sign In to Account
            </Link>
          </motion.div>

          {/* Interactive Hero Preview Card (Live Mock Score) */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 sm:mt-20 max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-indigo-900/5 p-6 sm:p-8 text-left"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Full-Stack Cloud Engineer</h4>
                <p className="text-xs text-slate-500">Jobs Portal Real-Time Deterministic Verification</p>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" /> 94% High Compatibility Match
              </div>
            </div>

            {/* Score Breakdown Bar Mock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/70">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">Skills Weight (60%)</span>
                  <span className="text-xs font-extrabold text-indigo-600">58 / 60</span>
                </div>
                <div className="w-full bg-indigo-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-600 h-2 rounded-full w-[96%]" />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">React, TypeScript, FastAPI, PostgreSQL</p>
              </div>

              <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-100/70">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">Experience (20%)</span>
                  <span className="text-xs font-extrabold text-violet-600">18 / 20</span>
                </div>
                <div className="w-full bg-violet-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-violet-600 h-2 rounded-full w-[90%]" />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">3.5 yrs matched vs 3.0 yrs required</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/70">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">Keywords (20%)</span>
                  <span className="text-xs font-extrabold text-emerald-600">18 / 20</span>
                </div>
                <div className="w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full w-[90%]" />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">REST APIs, JWT Auth, Microservices</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Metrics Strip */}
          <div className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">60/20/20</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Weighted Math Formula</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-2xl font-bold text-slate-900">100%</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Scoring Transparency</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-2xl font-bold text-slate-900">Instant</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Resume Extraction</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">MySQL</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Relational Integrity</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
            
            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">
              How Jobs Portal Powers Hiring
            </h2>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              From resume upload to interview scheduling, each stage is structured for speed, mathematical accuracy, and clarity.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {[
              {
                step: '01',
                title: 'Upload & Parse',
                desc: 'Candidates submit PDF or DOCX resumes. Skills, work experience, and profile details are automatically structured.',
                icon: FileCheck2,
                color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
              },
              {
                step: '02',
                title: 'Publish Requirements',
                desc: 'Recruiters post positions with specific required skills, years of experience, and role responsibilities.',
                icon: Briefcase,
                color: 'text-violet-600 bg-violet-50 border-violet-100',
              },
              {
                step: '03',
                title: 'Deterministic Match',
                desc: 'Our scoring engine evaluates applicants against requirements using the 60/20/20 weighted formula.',
                icon: Target,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
              },
              {
                step: '04',
                title: 'Screen & Upskill',
                desc: 'Recruiters screen top-ranked candidates while applicants access custom roadmaps to bridge skill gaps.',
                icon: Award,
                color: 'text-amber-600 bg-amber-50 border-amber-100',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="bg-slate-50/70 rounded-3xl p-6 border border-slate-200/80 relative flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-300">{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Deterministic ATS Architecture Section */}
      <section id="formula" className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
            
            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">
              Deterministic 60/20/20 ATS Formula
            </h2>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Every applicant receives a verifiable score calculated mathematically in Python based on normalized skills, verified experience, and semantic keyword relevance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              {...fadeInUp}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl font-bold bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xl">
                60%
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Skill Alignment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates candidate skill taxonomy against normalized job requirements (e.g. ReactJS → React, NodeJS → Node.js).
                Accounts for technical core competencies directly relevant to performance.
              </p>
              <div className="pt-2 text-xs font-semibold text-indigo-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Normalized Taxonomy Mapping
              </div>
            </motion.div>

            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-8 border  border-slate-200 shadow-sm space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-violet-50 font-bold border border-violet-100 text-violet-600 flex items-center justify-center font-black text-xl">
                20%
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Experience Fit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates proportional alignment between verified years of industry experience and required minimum thresholds.
                Ensures candidates match the seniority demanded by the role.
              </p>
              <div className="pt-2 text-xs font-semibold text-violet-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Proportional Seniority Fit
              </div>
            </motion.div>

            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 font-bold border border-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xl">
                20%
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Keyword Relevance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates contextual terminology and domain vocabulary overlap across technical descriptions, responsibilities, and previous project contributions.
              </p>
              <div className="pt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Domain Vocabulary Overlap
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portals & Roles Showcase (Interactive Tabs) */}
      <section id="portals" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-12">
            
            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">
              Two Dedicated Portals, One Unified Ecosystem
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Purpose-built interfaces tailored specifically for engineering candidates and modern recruiting teams.
            </p>

            {/* Tab Selector Buttons */}
            <div className="mt-8 inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => setActiveTab('candidate')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'candidate'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                For Candidates
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('recruiter')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'recruiter'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                For Recruiters
              </button>
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'candidate' ? (
              <motion.div
                key="candidate-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto"
              >
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                    <Compass className="w-4 h-4" /> Candidate Experience
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 leading-snug">
                    Gain Complete Transparency Into How Your Resume Matches Every Job
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Stop submitting resumes into the dark. Jobs Portal reveals your score breakdown before you apply,
                    highlights missing technical skills, and provides structured milestone roadmaps to bridge gaps.
                  </p>
                  <ul className="space-y-3 text-xs text-slate-700 font-medium pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>Instant resume parsing with bulleted experience extraction</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>Live 60/20/20 ATS match score preview across active job listings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>Milestone upskilling roadmaps with project and learning goals</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>Real-time application status tracking (Applied, Reviewing, Shortlisted)</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      Join as a Candidate <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Parsed Technical Profile
                    </div>
                    <div className="font-bold text-slate-900 text-base">Alex Rivera</div>
                    <div className="text-xs text-slate-500 mb-3">Full-Stack Engineer • 3.5 Years Experience</div>
                    <div className="flex flex-wrap gap-1.5">
                      {['React', 'TypeScript', 'Node.js', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'].map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Live Application Status</div>
                      <div className="text-sm font-bold text-slate-900">Lead Frontend Developer</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      Shortlisted (94%)
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="recruiter-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto"
              >
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-bold">
                    <Building className="w-4 h-4" /> Recruiter Management
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 leading-snug">
                    Rank Hundreds of Applicants Automatically With Zero Guesswork
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Cut screening time by 80%. When applicants apply, our deterministic algorithm scores them instantly,
                    giving your recruiting team an ordered leaderboard based on technical fitness and experience criteria.
                  </p>
                  <ul className="space-y-3 text-xs text-slate-700 font-medium pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-violet-600 flex-shrink-0" />
                      <span>Instant mathematical ranking of applicant pools for every role</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-violet-600 flex-shrink-0" />
                      <span>Customized company profile with logo, website, and industry sector</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-violet-600 flex-shrink-0" />
                      <span>In-depth applicant screening drawers with resume inspection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-violet-600 flex-shrink-0" />
                      <span>One-click application status progression and hiring notes</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      Post Jobs as a Recruiter <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Applicant Screening Board
                      </span>
                      <span className="text-xs font-bold text-indigo-600">32 Total Applicants</span>
                    </div>

                    {[
                      { name: 'Sarah Chen', score: '96%', match: 'Top Match', color: 'bg-emerald-50 text-emerald-700' },
                      { name: 'David Kumar', score: '91%', match: 'High Match', color: 'bg-emerald-50 text-emerald-700' },
                      { name: 'Elena Rostova', score: '82%', match: 'Good Match', color: 'bg-indigo-50 text-indigo-700' },
                    ].map((app, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{app.name}</div>
                          <div className="text-[11px] text-slate-500">FastAPI • React • 4 yrs exp</div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold ${app.color}`}>
                            {app.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Everything you need to know about Jobs Portal ATS scoring and workflow.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-3 flex items-center justify-between text-left font-semibold text-sm text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
                      openFaq === index ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-14 lg:py-16 text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 pb-12 border-b border-slate-100 text-xs">
            <div className="space-y-3.5 max-w-sm">
              <span className="font-semibold text-lg text-slate-900 tracking-tight">
                Jobs Portal
              </span>
              <p className="text-slate-500 leading-relaxed text-sm">
                Deterministic ATS Candidate Screening & Recruitment Suite with transparent weighted matching and relational architecture.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Candidate Portal</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/candidate/profile" className="hover:text-indigo-600 transition-colors block py-0.5">
                    Profile & Resume Parser
                  </Link>
                </li>
                <li>
                  <Link to="/candidate/jobs" className="hover:text-indigo-600 transition-colors block py-0.5">
                    Explore Job Openings
                  </Link>
                </li>
                <li>
                  <Link to="/candidate/roadmap" className="hover:text-indigo-600 transition-colors block py-0.5">
                    Upskilling Roadmap
                  </Link>
                </li>
                <li>
                  <Link to="/candidate/applications" className="hover:text-indigo-600 transition-colors block py-0.5">
                    My Applications
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Recruiter Portal</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/recruiter/dashboard" className="hover:text-indigo-600 transition-colors block py-0.5">
                    Recruiter Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/recruiter/jobs" className="hover:text-indigo-600 transition-colors block py-0.5">
                    Manage Job Postings
                  </Link>
                </li>
                <li>
                  <Link to="/recruiter/profile" className="hover:text-indigo-600 transition-colors block py-0.5">
                    Company Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center text-center text-sm text-slate-500">
            <p>© 2026 Jobs Portal Inc. ATS Candidate Screening & Recruitment Suite.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
