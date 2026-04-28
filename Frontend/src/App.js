import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
// Public Pages
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollTop from './components/ScrollTop';
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs';
import Features from './pages/Features';
import Contact from './pages/Contact';
import WhatsappButton from './components/WhatsappButton';



// Candidate Pages
import CandidateRegistration from "./components/Candidate/CandidateRegister";
import CandidateOtpVerification from "./components/Candidate/CandidateOtpVerification";
import CandidateProfilePage from "./components/Candidate/profile/CandidateProfilePage";
import CandidateProfileView from "./components/Candidate/profile/CandidateProfileView";
import CandidateProfileEdit from "./components/Candidate/profile/CandidateProfileEdit";
//import CandidateLogin from "./components/Candidate/CandidateLogin";
import CandidateWelcome from "./components/Candidate/CandidateWelcome";
import Portfolio from "./components/NewComponents/candi/Portfolio";
import ForgotPassword from "./components/Candidate/ForgotPassword";
import ResetPassword from "./components/Candidate/ResetPassword";

// Assessment Pages
import AssessmentHome from "./components/assessment/AssessmentHome";
import AssessmentInstructions from "./components/assessment/AssessmentInstructions";
import AssessmentLevel from "./components/assessment/AssessmentLevel";
import AssessmentResult from "./components/assessment/AssessmentResult";
import AssessmentComplete from "./components/assessment/AssessmentComplete";
import CoursesDashboard from "./components/assessment/CoursesDashboard";

// Admin Pages
import AdminDashboard from "./components/Admin/AdminDashboard";
import CandidatesList from "./components/Admin/CandidatesList";
import CandidateDetails from "./components/Admin/CandidateDetails";
import AccessRequests from "./components/Admin/AccessRequests";
import AdminManageTests from "./components/Admin/AdminManageTests";
import AdminLiveMonitoring from "./components/Admin/AdminLiveMonitoring";
import AdminViewJobs from "./components/Admin/AdminViewJobs";
import AdminInterestedCandidates from "./components/Admin/AdminInterestedCandidates";
// import PaymentsList from "./components/Admin/PaymentsList";
import PaymentDashboard from "./components/Admin/PaymentDashboard";
import PaymentDetails from "./components/Admin/PaymentDetails";
import PendingCandidates from "./components/Admin/PendingCandidates";
// import AdminLogin from "./components/Admin/AdminLogin";

// HR Pages
import HRRegistration from './components/HR/HRRegistration';
// import HRLogin from './components/HR/HRLogin';
import HRDashboard from "./components/HR/HRDashboard";
import HRManagement from "./components/HR/HRManagement";
import HRWelcome from "./components/HR/HRWelcome";
import HRCandidateList from "./components/HR/HRCandidateList";
import HrCandidateDetails from "./components/HR/HrCandidateDetails";
import HRInterestedCandidates from "./components/HR/HRInterestedCandidates";

// Payment Pages
import PaymentPlans from "./components/Payment/PaymentPlans";
import PaymentSuccess from "./components/Payment/PaymentSuccess";
import PaymentFailed from "./components/Payment/PaymentFailed";
import PaymentHistory from "./components/Payment/PaymentHistory";
// import Login from "./components/NewComponents/candi/login";

import LandingPage from "./components/newland/LandingPage";
import Login from './components/Login';
import VerifyEmail from './components/VerifyEmail';



// Candidate Dashboard
function CandidateHome() {
  return (
    <div className="vh-role-home">
      <h2>Welcome, Candidate!</h2>
      <p>This is your candidate dashboard.</p>
    </div>
  );
}

// Layout Wrapper
function LayoutWrapper({ children }) {
  const location = useLocation();

  // Paths where header/footer should not show
  const hideLayoutPaths = [
    '/landing',
    '/candidate-registration',
    '/forgot-password',
    '/reset-password',
    '/candidate/verify-otp',
    '/login',
    '/register',
    '/hrs/register',
    '/hrs/login',
    '/hr-home',
    '/ranklist',
    '/search-candidate',
    '/candidate-home',
    '/admin/dashboard',
    '/admin/candidates',
    '/admin/hr',
    '/admin/requests',
    '/admin/payments',
    '/admin/manage-tests',
    '/admin/live-monitoring',
    '/admin/login',
    '/verify-email'
  ];

  // Paths where scroll should be disabled (only login/register)
  const disableScrollPaths = [
    '/login',
    '/register'
  ];

  const shouldHideLayout =
    hideLayoutPaths.includes(location.pathname) ||
    location.pathname.startsWith('/admin/') ||
    location.pathname.startsWith('/candidate/profile') ||
    location.pathname.startsWith('/courses') ||
    location.pathname.startsWith('/assessment') ||
    location.pathname.startsWith('/hr/') ||
    location.pathname.startsWith('/candidates/') ||
    location.pathname.startsWith('/payments/');
  const shouldDisableScroll = disableScrollPaths.includes(location.pathname);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('header');
      const scrollTop = window.pageYOffset;

      if (header) {
        header.style.boxShadow =
          scrollTop > 100
            ? '0 4px 20px rgba(0, 0, 0, 0.1)'
            : '0 2px 10px rgba(0, 0, 0, 0.1)';
      }

      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Disable scroll only when on login/register page
  useEffect(() => {
    if (shouldDisableScroll) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [shouldDisableScroll]);

  return (
    <div className="App">
      {!shouldHideLayout && <Header />}

      <main>{children}</main>

      {!shouldHideLayout && <Footer />}
      {!shouldHideLayout && (
        <ScrollTop showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
      )}
      {!shouldHideLayout && <WhatsappButton />}
    </div>
  );
}
// App Component
function App() {
  return (
    <LayoutWrapper>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />


        {/* Default Landing Page */}
        <Route path="/landing" element={<LandingPage />} />

        {/* Candidate Pages */}
        <Route path="/candidate/login" element={<Login />} />
        <Route path="/candidate-registration" element={<CandidateRegistration />} />
        <Route path="/candidate/verify-otp" element={<CandidateOtpVerification />} />
        <Route path="/candidate/profile" element={<CandidateProfilePage />} />
        <Route path="/candidate/profile/view" element={<CandidateProfileView />} />
        <Route path="/candidate/profile/edit" element={<CandidateProfileEdit />} />
        <Route path="/candidates/welcome" element={<CandidateWelcome />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Assessment Pages */}
        <Route path="/assessment" element={<AssessmentHome />} />
        <Route path="/assessment/result" element={<AssessmentResult />} />
        <Route path="/assessment/complete" element={<AssessmentComplete />} />
        <Route path="/assessment/instructions/:subject/:level" element={<AssessmentInstructions />} />
        <Route path="/assessment/:subject/:level" element={<AssessmentLevel />} />
        <Route path="/courses" element={<CoursesDashboard />} />

        {/* Admin Pages */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/candidates" element={<CandidatesList />} />
        <Route path="/admin/candidates/:id" element={<CandidateDetails />} />
        <Route path="/admin/access-requests" element={<AccessRequests />} />
        <Route path="/admin/payments" element={<PaymentDashboard />} />
        <Route path="/admin/payments/:id" element={<PaymentDetails />} />
        <Route path="/admin/pending-candidates" element={<PendingCandidates />} />
        <Route path="/admin/manage-tests" element={<AdminManageTests />} />
        <Route path="/admin/live-monitoring" element={<AdminLiveMonitoring />} />
        <Route path="/admin/view-jobs" element={<AdminViewJobs />} />
        <Route path="/admin/interested-candidates" element={<AdminInterestedCandidates />} />
        <Route path="/admin/questions/*" element={<Navigate to="/admin/manage-tests" replace />} />
        <Route path="/candidate/login" element={<Login />} />
        <Route path="/hrs/login" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/hrs/register" element={<HRRegistration />} />

        <Route path="/hr/dashboard" element={<HRDashboard />} />
        <Route path="/admin/hrs" element={<HRManagement />} />
        <Route path="/hr/welcome" element={<HRWelcome />} />
        <Route path="/hr/candidates" element={<HRCandidateList />} />
        <Route path="/hr/candidate/:id" element={<HrCandidateDetails />} />
        <Route path="/hr/interested-candidates" element={<HRInterestedCandidates />} />

        {/* Payment Pages */}
        <Route path="/payments/plans" element={<PaymentPlans />} />
        <Route path="/payments/success" element={<PaymentSuccess />} />
        <Route path="/payments/failure" element={<PaymentFailed />} />
        <Route path="/payments/history" element={<PaymentHistory />} />

        <Route path="/verify-email" element={<VerifyEmail />} />



        {/* Fallback */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </LayoutWrapper>

  );
}

export default App;




