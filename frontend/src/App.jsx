import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import Spinner from './components/ui/Spinner';

// Lazy load pages for better performance
const DashboardPage   = lazy(() => import('./components/dashboard/DashboardPage'));
const HabitsPage      = lazy(() => import('./components/habits/HabitsPage'));
const TasksPage       = lazy(() => import('./components/tasks/TasksPage'));
const GoalsPage       = lazy(() => import('./components/goals/GoalsPage'));
const AcademicPage    = lazy(() => import('./components/academic/AcademicPage'));
const CalendarPage    = lazy(() => import('./components/calendar/CalendarPage'));
const PlannerPage     = lazy(() => import('./components/planner/PlannerPage'));
const FocusPage       = lazy(() => import('./components/focus/FocusPage'));
const StatisticsPage  = lazy(() => import('./components/statistics/StatisticsPage'));
const AchievementsPage = lazy(() => import('./components/achievements/AchievementsPage'));
const NotesPage       = lazy(() => import('./components/notes/NotesPage'));
const ProfilePage     = lazy(() => import('./components/profile/ProfilePage'));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[400px]">
    <Spinner size="lg" />
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/register"        element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
        <Route path="habits"       element={<Suspense fallback={<PageLoader />}><HabitsPage /></Suspense>} />
        <Route path="tasks"        element={<Suspense fallback={<PageLoader />}><TasksPage /></Suspense>} />
        <Route path="goals"        element={<Suspense fallback={<PageLoader />}><GoalsPage /></Suspense>} />
        <Route path="academic"     element={<Suspense fallback={<PageLoader />}><AcademicPage /></Suspense>} />
        <Route path="calendar"     element={<Suspense fallback={<PageLoader />}><CalendarPage /></Suspense>} />
        <Route path="planner"      element={<Suspense fallback={<PageLoader />}><PlannerPage /></Suspense>} />
        <Route path="focus"        element={<Suspense fallback={<PageLoader />}><FocusPage /></Suspense>} />
        <Route path="statistics"   element={<Suspense fallback={<PageLoader />}><StatisticsPage /></Suspense>} />
        <Route path="achievements" element={<Suspense fallback={<PageLoader />}><AchievementsPage /></Suspense>} />
        <Route path="notes"        element={<Suspense fallback={<PageLoader />}><NotesPage /></Suspense>} />
        <Route path="profile"      element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
