import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { SignInPage } from './pages/public/SignInPage';
import { SignUpPage } from './pages/public/SignUpPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

// Trainee Pages
import { TraineeDashboard } from './pages/trainee/TraineeDashboard';
import { TraineeCompetencies } from './pages/trainee/TraineeCompetencies';
import { TraineeSkillGaps } from './pages/trainee/TraineeSkillGaps';
import { TraineeRecommendations } from './pages/trainee/TraineeRecommendations';
import { TraineeCourses } from './pages/trainee/TraineeCourses';
import { TraineeCourseDetail } from './pages/trainee/TraineeCourseDetail';
import { TraineeMyLearning } from './pages/trainee/TraineeMyLearning';
import { TraineeAssessments } from './pages/trainee/TraineeAssessments';
import { TakeAssessmentPage } from './pages/trainee/TakeAssessmentPage';
import { TraineeResults } from './pages/trainee/TraineeResults';
import { TraineeCertificates } from './pages/trainee/TraineeCertificates';
import { TraineeFeedback } from './pages/trainee/TraineeFeedback';
import { TraineeNotifications } from './pages/trainee/TraineeNotifications';
import { TraineeProfile } from './pages/trainee/TraineeProfile';

// Trainer Pages
import { TrainerDashboard } from './pages/trainer/TrainerDashboard';
import { TrainerCourses } from './pages/trainer/TrainerCourses';
import { TrainerCourseCreate } from './pages/trainer/TrainerCourseCreate';
import { TrainerResources } from './pages/trainer/TrainerResources';
import { TrainerAIQuiz } from './pages/trainer/TrainerAIQuiz';
import { TrainerAssessments } from './pages/trainer/TrainerAssessments';
import { TrainerPerformance } from './pages/trainer/TrainerPerformance';
import { TrainerTrainingRequests } from './pages/trainer/TrainerTrainingRequests';
import { TrainerProfile } from './pages/trainer/TrainerProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminCompetencyFramework } from './pages/admin/AdminCompetencyFramework';
import { AdminTrainingRequirements } from './pages/admin/AdminTrainingRequirements';
import { AdminTrainerMatching } from './pages/admin/AdminTrainerMatching';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminSettings } from './pages/admin/AdminSettings';

const AppLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        {user && <Sidebar />}
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes with Full View */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Authenticated Layout Routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />

            {/* Trainee Portal */}
            <Route path="/trainee/dashboard" element={<ProtectedRoute allowedRoles={['trainee', 'admin']}><TraineeDashboard /></ProtectedRoute>} />
            <Route path="/trainee/competencies" element={<ProtectedRoute allowedRoles={['trainee', 'admin']}><TraineeCompetencies /></ProtectedRoute>} />
            <Route path="/trainee/skill-gaps" element={<ProtectedRoute allowedRoles={['trainee', 'admin']}><TraineeSkillGaps /></ProtectedRoute>} />
            <Route path="/trainee/recommendations" element={<ProtectedRoute allowedRoles={['trainee', 'admin']}><TraineeRecommendations /></ProtectedRoute>} />
            <Route path="/trainee/courses" element={<ProtectedRoute allowedRoles={['trainee', 'admin']}><TraineeCourses /></ProtectedRoute>} />
            <Route path="/trainee/courses/:id" element={<ProtectedRoute allowedRoles={['trainee', 'admin']}><TraineeCourseDetail /></ProtectedRoute>} />
            <Route path="/trainee/my-learning" element={<ProtectedRoute allowedRoles={['trainee', 'admin']}><TraineeMyLearning /></ProtectedRoute>} />
            <Route path="/trainee/assessments" element={<ProtectedRoute allowedRoles={['trainee', 'admin']}><TraineeAssessments /></ProtectedRoute>} />
            <Route path="/trainee/assessments/:id/take" element={<ProtectedRoute allowedRoles={['trainee', 'admin']}><TakeAssessmentPage /></ProtectedRoute>} />
            <Route path="/trainee/results" element={<ProtectedRoute allowedRoles={['trainee', 'admin']}><TraineeResults /></ProtectedRoute>} />
            <Route path="/trainee/certificates" element={<ProtectedRoute allowedRoles={['trainee', 'admin']}><TraineeCertificates /></ProtectedRoute>} />
            <Route path="/trainee/feedback" element={<ProtectedRoute allowedRoles={['trainee', 'admin']}><TraineeFeedback /></ProtectedRoute>} />
            <Route path="/trainee/notifications" element={<ProtectedRoute allowedRoles={['trainee', 'admin']}><TraineeNotifications /></ProtectedRoute>} />
            <Route path="/trainee/profile" element={<ProtectedRoute allowedRoles={['trainee', 'admin']}><TraineeProfile /></ProtectedRoute>} />

            {/* Trainer Portal */}
            <Route path="/trainer/dashboard" element={<ProtectedRoute allowedRoles={['trainer', 'admin']}><TrainerDashboard /></ProtectedRoute>} />
            <Route path="/trainer/courses" element={<ProtectedRoute allowedRoles={['trainer', 'admin']}><TrainerCourses /></ProtectedRoute>} />
            <Route path="/trainer/courses/create" element={<ProtectedRoute allowedRoles={['trainer', 'admin']}><TrainerCourseCreate /></ProtectedRoute>} />
            <Route path="/trainer/resources" element={<ProtectedRoute allowedRoles={['trainer', 'admin']}><TrainerResources /></ProtectedRoute>} />
            <Route path="/trainer/ai-quiz" element={<ProtectedRoute allowedRoles={['trainer', 'admin']}><TrainerAIQuiz /></ProtectedRoute>} />
            <Route path="/trainer/assessments" element={<ProtectedRoute allowedRoles={['trainer', 'admin']}><TrainerAssessments /></ProtectedRoute>} />
            <Route path="/trainer/performance" element={<ProtectedRoute allowedRoles={['trainer', 'admin']}><TrainerPerformance /></ProtectedRoute>} />
            <Route path="/trainer/training-requests" element={<ProtectedRoute allowedRoles={['trainer', 'admin']}><TrainerTrainingRequests /></ProtectedRoute>} />
            <Route path="/trainer/profile" element={<ProtectedRoute allowedRoles={['trainer', 'admin']}><TrainerProfile /></ProtectedRoute>} />

            {/* Admin Portal */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><AdminCourses /></ProtectedRoute>} />
            <Route path="/admin/competency-framework" element={<ProtectedRoute allowedRoles={['admin']}><AdminCompetencyFramework /></ProtectedRoute>} />
            <Route path="/admin/training-requirements" element={<ProtectedRoute allowedRoles={['admin']}><AdminTrainingRequirements /></ProtectedRoute>} />
            <Route path="/admin/trainer-matching" element={<ProtectedRoute allowedRoles={['admin']}><AdminTrainerMatching /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnnouncements /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
