export type UserRole = 'candidate' | 'recruiter';

export interface EducationItem {
  institution: string;
  degree: string;
  field_of_study?: string;
  start_year?: string;
  end_year?: string;
  grade?: string;
}

export interface ExperienceItem {
  company: string;
  title: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  responsibilities?: string[];
  bullet_points?: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year?: string;
}

export interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  technical_skills: string[];
  soft_skills: string[];
  education: EducationItem[];
  work_experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  total_experience_years: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  location?: string;
  profile_image?: string;
  // Recruiter fields
  company_name?: string;
  company_website?: string;
  company_description?: string;
  company_logo?: string;
  company_email?: string;
  industry?: string;
  company_linkedin_url?: string;
  company_type?: string;
  designation?: string;
  department?: string;
  // Candidate fields
  skills: string[];
  experience_years: number;
  education: EducationItem[];
  resume_path?: string;
  resume_parsed_data?: ParsedResumeData;
  date_of_birth?: string;
  gender?: string;
  preferred_locations?: string[];
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  recruiter_id: string;
  title: string;
  company_name: string;
  description: string;
  responsibilities?: string;
  required_skills: string[];
  preferred_skills: string[];
  location: string;
  job_type: string;
  work_mode: string;
  salary_min?: number;
  salary_max?: number;
  experience_required: number;
  education_required?: string;
  application_deadline?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  applications_count?: number;
  match_score?: number;
  is_saved?: boolean;
}

export interface ApplicationMatchBreakdown {
  match_score: number;
  skill_score: number;
  experience_score: number;
  relevance_score: number;
  matched_skills: string[];
  missing_skills: string[];
  explanation: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  recruiter_id: string;
  resume_snapshot_path?: string;
  match_score: number;
  match_breakdown: ApplicationMatchBreakdown;
  matched_skills: string[];
  missing_skills: string[];
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'rejected' | 'accepted';
  applied_at: string;
  updated_at: string;
  job?: Job;
  candidate?: User;
}

export interface Interview {
  id: string;
  application_id: string;
  job_id: string;
  candidate_id: string;
  recruiter_id: string;
  scheduled_date: string;
  scheduled_time: string;
  meeting_link?: string;
  interview_type: string;
  notes?: string;
  status: string;
  created_at: string;
  job?: Job;
  candidate?: User;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface CareerMilestone {
  phase: number;
  title: string;
  timeline: string;
  description: string;
  skills_to_learn: string[];
  recommended_courses: string[];
  hands_on_project: string;
}

export interface CareerRoadmap {
  id?: string;
  target_role: string;
  current_skills: string[];
  missing_skills: string[];
  milestones: CareerMilestone[];
  recommendations: string;
  created_at?: string;
}

export interface RecruiterDashboardData {
  total_jobs: number;
  active_jobs: number;
  total_applications: number;
  shortlisted_candidates: number;
  interviews_scheduled: number;
  hiring_funnel: Array<{ stage: string; count: number }>;
  top_skills: Array<{ name: string; count: number }>;
  recent_applications: Array<{
    id: string;
    job_title: string;
    candidate_name: string;
    match_score: number;
    status: string;
    applied_at: string;
  }>;
}

