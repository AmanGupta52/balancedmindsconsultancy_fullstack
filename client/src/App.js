import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthModalProvider } from "./context/AuthModalContext";
import { LEGACY_SERVICE_PATHS } from "./data/services";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Loading } from "./components/ui/Feedback";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ExpertsPage from "./pages/ExpertsPage";
import ContactPage from "./pages/ContactPage";
import NewsPage from "./pages/NewsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import { PrivacyPage, TermsPage } from "./pages/LegalPages";

// Heavy / role-specific pages are split into their own bundles.
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ModeratorDashboard = lazy(() => import("./pages/moderator/ModeratorDashboard"));
const VideoCallPage = lazy(() => import("./pages/VideoCallPage"));

// Old URLs such as /Counselling or /Service keep working.
// (route matching is case-insensitive, so /Counselling and /counselling are one entry)
const legacyRedirects = [
  ...new Map(
    Object.entries(LEGACY_SERVICE_PATHS).map(([from, slug]) => [from.toLowerCase(), { from: from.toLowerCase(), to: `/services/${slug}` }])
  ).values(),
  { from: "/service", to: "/services" },
  { from: "/notifications", to: "/" },
];

function LegacyRedirect({ to }) {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AuthModalProvider>
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* full-screen pages without the site header/footer */}
                <Route path="/videocall" element={<ProtectedRoute><VideoCallPage /></ProtectedRoute>} />
                <Route path="/admin-dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/moderator-dashboard" element={<ProtectedRoute roles={["moderator"]}><ModeratorDashboard /></ProtectedRoute>} />

                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="services" element={<ServicesPage />} />
                  <Route path="services/:slug" element={<ServiceDetailPage />} />
                  <Route path="experts" element={<ExpertsPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="news" element={<NewsPage />} />
                  <Route path="profile" element={<ProtectedRoute roles={["user"]}><ProfilePage /></ProtectedRoute>} />
                  <Route path="privacy" element={<PrivacyPage />} />
                  <Route path="terms" element={<TermsPage />} />
                  {legacyRedirects.map(({ from, to }) => (
                    <Route key={from} path={from.slice(1)} element={<LegacyRedirect to={to} />} />
                  ))}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </AuthModalProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
