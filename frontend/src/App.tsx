import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Layouts
import { CandidateLayout } from './layouts/CandidateLayout';
import { RecruiterLayout } from './layouts/RecruiterLayout';

// Common Pages
import { LandingPage } from './pages/common/LandingPage';
import { LoginPage } from './pages/common/LoginPage';
import { RegisterPage } from './pages/common/RegisterPage';
import { NotFoundPage } from './pages/common/NotFoundPage';

// Candidate Pages
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { CandidateProfile } from './pages/candidate/CandidateProfile';
import { JobDiscovery } from './pages/candidate/JobDiscovery';
import { JobDetails } from './pages/candidate/JobDetails';
import { CandidateApplications } from './pages/candidate/CandidateApplications';
import { CareerRoadmapPage } from './pages/candidate/CareerRoadmapPage';

// Recruiter Pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { RecruiterJobs } from './pages/recruiter/RecruiterJobs';
import { ApplicantScreening } from './pages/recruiter/ApplicantScreening';
import { RecruiterProfile } from './pages/recruiter/RecruiterProfile';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          className: 'font-sans font-medium',
          style: {
            fontFamily: "'Google Sans Flex', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Candidate Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
            <Route path="/candidate" element={<CandidateLayout />}>
              <Route index element={<Navigate to="/candidate/dashboard" replace />} />
              <Route path="dashboard" element={<CandidateDashboard />} />
              <Route path="profile" element={<CandidateProfile />} />
              <Route path="jobs" element={<JobDiscovery />} />
              <Route path="jobs/:id" element={<JobDetails />} />
              <Route path="applications" element={<CandidateApplications />} />
              <Route path="roadmap" element={<CareerRoadmapPage />} />
            </Route>
          </Route>

          {/* Recruiter Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
            <Route path="/recruiter" element={<RecruiterLayout />}>
              <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
              <Route path="dashboard" element={<RecruiterDashboard />} />
              <Route path="jobs" element={<RecruiterJobs />} />
              <Route path="jobs/:jobId/applicants" element={<ApplicantScreening />} />
              <Route path="profile" element={<RecruiterProfile />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

