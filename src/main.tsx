import React from 'react';
import ReactDOM from 'react-dom/client';
import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';

import App from './App';
import Layout from './components/Layout/Layout';
import { useThemeStore } from './stores/themeStore';
import { getTheme } from './theme';
import AuthLayout from './components/Layout/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CoursesPage from './pages/courses/CoursesPage';
import GradesPage from './pages/grades/GradesPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import SchedulePage from './pages/schedule/SchedulePage';
import ProfilePage from './pages/profile/ProfilePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import StaffDirectoryPage from './pages/staff/StaffDirectoryPage';
import CampusMapPage from './pages/campusmap/CampusMapPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import RoleManagementPage from './pages/admin/RoleManagementPage';
import UserRoleAssignmentPage from './pages/admin/UserRoleAssignmentPage';
import StaffManagementPage from './pages/admin/StaffManagementPage';
import StudentProfileManagement from './pages/admin/StudentProfileManagement';
import EmailLogsPage from './pages/admin/EmailLogsPage';
import AssignmentsDashboard from './pages/AssignmentsDashboard';
import AssignmentDetail from './pages/AssignmentDetail';
import StudentReceiptsPage from './pages/receipts/StudentReceiptsPage';
import StudentRegistrationPage from './pages/registration/StudentRegistrationPage';
import StudentIdCardPage from './pages/StudentIdCardPage';
import AdminReceiptsPage from './pages/admin/AdminReceiptsPage';
import AdminRegistrationsPage from './pages/admin/AdminRegistrationsPage';
import AdminEmailSettingsPage from './pages/admin/AdminEmailSettingsPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import AdminBulkPrinting from './pages/admin/AdminBulkPrinting';
import AdminSystemSettings from './pages/admin/AdminSystemSettings';
import BarcodeScannerPage from './pages/admin/BarcodeScannerPage';
import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import LecturerCourses from './pages/lecturer/LecturerCourses';
import LecturerCourseStudents from './pages/lecturer/LecturerCourseStudents';
import LecturerGradeEntry from './pages/lecturer/LecturerGradeEntry';
import LecturerMaterials from './pages/lecturer/LecturerMaterials';
import LecturerConsultation from './pages/lecturer/LecturerConsultation';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffReceiptsPage from './pages/staff/StaffReceiptsPage';
import StaffRegistrationsPage from './pages/staff/StaffRegistrationsPage';
import StaffRegistrationReview from './pages/staff/StaffRegistrationReview';
import StaffScannerPage from './pages/staff/StaffScannerPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { AdminRoute, LecturerRoute, StaffRoute } from './components/RBAC/RouteGuard';

import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthLayout>
        <RegisterPage />
      </AuthLayout>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <AuthLayout>
        <ForgotPasswordPage />
      </AuthLayout>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <AuthLayout>
        <ResetPasswordPage />
      </AuthLayout>
    ),
  },
  
  // Protected routes with layout
  {
    path: '/*',
    element: (
      <ProtectedRoute>
        <Layout>
          <Outlet />
        </Layout>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'courses',
        element: <CoursesPage />,
      },
      {
        path: 'grades',
        element: <GradesPage />,
      },
      {
        path: 'payments',
        element: <PaymentsPage />,
      },
      {
        path: 'schedule',
        element: <SchedulePage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'staff',
        element: <StaffDirectoryPage />,
      },
      {
        path: 'campus-map',
        element: <CampusMapPage />,
      },
      {
        path: 'assignments',
        element: <AssignmentsDashboard />,
      },
      {
        path: 'assignments/:id',
        element: <AssignmentDetail />,
      },
      {
        path: 'receipts',
        element: <StudentReceiptsPage />,
      },
      {
        path: 'registration',
        element: <StudentRegistrationPage />,
      },
      {
        path: 'id-card',
        element: <StudentIdCardPage />,
      },
      // Lecturer routes
      {
        path: 'lecturer',
        element: (
          <LecturerRoute>
            <LecturerDashboard />
          </LecturerRoute>
        ),
      },
      {
        path: 'lecturer/courses',
        element: (
          <LecturerRoute>
            <LecturerCourses />
          </LecturerRoute>
        ),
      },
      {
        path: 'lecturer/courses/:courseId/students',
        element: (
          <LecturerRoute>
            <LecturerCourseStudents />
          </LecturerRoute>
        ),
      },
      {
        path: 'lecturer/courses/:courseId/grades',
        element: (
          <LecturerRoute>
            <LecturerGradeEntry />
          </LecturerRoute>
        ),
      },
      {
        path: 'lecturer/materials',
        element: (
          <LecturerRoute>
            <LecturerMaterials />
          </LecturerRoute>
        ),
      },
      {
        path: 'lecturer/consultation',
        element: (
          <LecturerRoute>
            <LecturerConsultation />
          </LecturerRoute>
        ),
      },
      // Staff routes
      {
        path: 'staff',
        element: (
          <StaffRoute>
            <StaffDashboard />
          </StaffRoute>
        ),
      },
      {
        path: 'staff/receipts',
        element: (
          <StaffRoute>
            <StaffReceiptsPage />
          </StaffRoute>
        ),
      },
      {
        path: 'staff/registrations',
        element: (
          <StaffRoute>
            <StaffRegistrationsPage />
          </StaffRoute>
        ),
      },
      {
        path: 'staff/registrations/:id',
        element: (
          <StaffRoute>
            <StaffRegistrationReview />
          </StaffRoute>
        ),
      },
      {
        path: 'staff/scanner',
        element: (
          <StaffRoute>
            <StaffScannerPage />
          </StaffRoute>
        ),
      },
      // Admin routes
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/roles',
        element: (
          <AdminRoute>
            <RoleManagementPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <AdminRoute>
            <UserRoleAssignmentPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/staff',
        element: (
          <AdminRoute>
            <StaffManagementPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/students',
        element: (
          <AdminRoute>
            <StudentProfileManagement />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/email-logs',
        element: (
          <AdminRoute>
            <EmailLogsPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/receipts',
        element: (
          <AdminRoute>
            <AdminReceiptsPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/registrations',
        element: (
          <AdminRoute>
            <AdminRegistrationsPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/email-settings',
        element: (
          <AdminRoute>
            <AdminEmailSettingsPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/barcode-scanner',
        element: (
          <AdminRoute>
            <BarcodeScannerPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/announcements',
        element: (
          <AdminRoute>
            <AdminAnnouncementsPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/bulk-printing',
        element: (
          <AdminRoute>
            <AdminBulkPrinting />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/system-settings',
        element: (
          <AdminRoute>
            <AdminSystemSettings />
          </AdminRoute>
        ),
      },
      {
        path: '*',
        element: <DashboardPage />,
      },
    ],
  },
]);

function AppRoot() {
  const mode = useThemeStore((s) => s.mode);
  const theme = useMemo(() => getTheme(mode), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff' },
          success: { duration: 3000, iconTheme: { primary: '#4caf50', secondary: '#fff' } },
          error: { duration: 5000, iconTheme: { primary: '#f44336', secondary: '#fff' } },
        }}
      />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRoot />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
