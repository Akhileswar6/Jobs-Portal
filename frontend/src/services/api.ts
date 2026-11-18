import { apiClient } from '../api/client';
import {
  User,
  Job,
  Application,
  Interview,
  Notification,
  CareerRoadmap,
  RecruiterDashboardData,
  ParsedResumeData,
} from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData: any) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
};

export const jobsApi = {
  listJobs: async (params?: any): Promise<{ items: Job[]; total: number; total_pages: number }> => {
    const res = await apiClient.get('/jobs', { params });
    return res.data;
  },
  getMyJobs: async (): Promise<Job[]> => {
    const res = await apiClient.get('/jobs/recruiter/my-jobs');
    return res.data;
  },
  getJob: async (jobId: string): Promise<Job> => {
    const res = await apiClient.get(`/jobs/${jobId}`);
    return res.data;
  },
  createJob: async (jobData: Partial<Job>): Promise<Job> => {
    const res = await apiClient.post('/jobs', jobData);
    return res.data;
  },
  updateJob: async (jobId: string, jobData: Partial<Job>): Promise<Job> => {
    const res = await apiClient.put(`/jobs/${jobId}`, jobData);
    return res.data;
  },
  deleteJob: async (jobId: string) => {
    const res = await apiClient.delete(`/jobs/${jobId}`);
    return res.data;
  },
};

export const candidateApi = {
  getProfile: async (): Promise<User> => {
    const res = await apiClient.get('/candidate/profile');
    return res.data;
  },
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await apiClient.put('/candidate/profile', data);
    return res.data;
  },
  uploadPhoto: async (file: File): Promise<{ profile_image: string; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/candidate/photo/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  uploadResume: async (file: File): Promise<{ filename: string; parsed_data: ParsedResumeData; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/candidate/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getApplications: async (): Promise<Application[]> => {
    const res = await apiClient.get('/candidate/applications');
    return res.data;
  },
  getSavedJobs: async (): Promise<Job[]> => {
    const res = await apiClient.get('/candidate/saved-jobs');
    return res.data;
  },
  saveJob: async (jobId: string) => {
    const res = await apiClient.post(`/candidate/saved-jobs/${jobId}`);
    return res.data;
  },
  unsaveJob: async (jobId: string) => {
    const res = await apiClient.delete(`/candidate/saved-jobs/${jobId}`);
    return res.data;
  },
};

export const recruiterApi = {
  getProfile: async (): Promise<User> => {
    const res = await apiClient.get('/recruiter/profile');
    return res.data;
  },
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await apiClient.put('/recruiter/profile', data);
    return res.data;
  },
  uploadLogo: async (file: File): Promise<{ company_logo: string; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/recruiter/logo/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getDashboardAnalytics: async (): Promise<RecruiterDashboardData> => {
    const res = await apiClient.get('/recruiter/dashboard');
    return res.data;
  },
  getJobApplicants: async (jobId: string, sortBy: string = 'score'): Promise<Application[]> => {
    const res = await apiClient.get(`/jobs/${jobId}/applications`, {
      params: { sort_by: sortBy },
    });
    return res.data;
  },
};

export const applicationsApi = {
  apply: async (jobId: string): Promise<Application> => {
    const res = await apiClient.post('/applications', { job_id: jobId });
    return res.data;
  },
  getApplication: async (appId: string): Promise<Application> => {
    const res = await apiClient.get(`/applications/${appId}`);
    return res.data;
  },
  updateStatus: async (appId: string, status: string): Promise<Application> => {
    const res = await apiClient.patch(`/applications/${appId}/status`, { status });
    return res.data;
  },
};

export const interviewsApi = {
  schedule: async (data: any): Promise<Interview> => {
    const res = await apiClient.post('/interviews', data);
    return res.data;
  },
  list: async (): Promise<Interview[]> => {
    const res = await apiClient.get('/interviews');
    return res.data;
  },
  update: async (interviewId: string, data: any): Promise<Interview> => {
    const res = await apiClient.put(`/interviews/${interviewId}`, data);
    return res.data;
  },
  cancel: async (interviewId: string) => {
    const res = await apiClient.delete(`/interviews/${interviewId}`);
    return res.data;
  },
};

export const aiApi = {
  analyzeResumeText: async (text: string): Promise<ParsedResumeData> => {
    const res = await apiClient.post('/ai/analyze-resume', { resume_text: text });
    return res.data;
  },
  generateRoadmap: async (data: { target_role: string; current_skills?: string[]; experience_years?: number }): Promise<CareerRoadmap> => {
    const res = await apiClient.post('/ai/generate-roadmap', data);
    return res.data;
  },
  getSavedRoadmaps: async (): Promise<CareerRoadmap[]> => {
    const res = await apiClient.get('/ai/roadmaps');
    return res.data;
  },
  analyzeJobDescription: async (description: string) => {
    const res = await apiClient.post('/ai/analyze-job-description', { job_description: description });
    return res.data;
  },
};

export const notificationsApi = {
  list: async (): Promise<Notification[]> => {
    const res = await apiClient.get('/notifications');
    return res.data;
  },
  markRead: async (notificationId: string) => {
    const res = await apiClient.patch(`/notifications/${notificationId}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await apiClient.patch('/notifications/read-all');
    return res.data;
  },
};

export const resumeApi = {
  getDownloadUrl: (candidateId: string) => {
    return `${apiClient.defaults.baseURL}/resume/download/${candidateId}`;
  },
  downloadMyResume: async (): Promise<Blob> => {
    const res = await apiClient.get('/resume/my-resume', { responseType: 'blob' });
    return res.data;
  },
  downloadCandidateResume: async (candidateId: string): Promise<Blob> => {
    const res = await apiClient.get(`/resume/download/${candidateId}`, { responseType: 'blob' });
    return res.data;
  },
};

