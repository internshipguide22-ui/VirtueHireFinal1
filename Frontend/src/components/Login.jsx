import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Lock, Mail, Shield, Users, UserCheck, Eye, EyeOff, ArrowLeft, Sparkles, Zap, TrendingUp } from 'lucide-react';
import './Login.css';
import { syncStoredHrUser } from '../utils/hrSubscription';

const Login = () => {
    const [activeTab, setActiveTab] = useState('candidate'); // candidate, hr, admin
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname.toLowerCase();
        if (path.includes('hr')) {
            setActiveTab('hr');
        } else if (path.includes('admin')) {
            setActiveTab('admin');
        } else if (path.includes('candidate')) {
            setActiveTab('candidate');
        }
    }, [location.pathname]);

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    useEffect(() => {
        if (location.state?.verifiedEmail && activeTab === 'candidate') {
            setEmail(location.state.verifiedEmail);
            setSuccess('Email verified successfully. Please log in.');
        }

        if (location.state?.registeredEmail && activeTab === 'hr') {
            setEmail(location.state.registeredEmail);
            setSuccess(
                location.state.successMessage ||
                'Registration successful. Please verify your email first, then wait for admin approval before logging in.'
            );
        }
    }, [activeTab, location.state]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const role = activeTab.toUpperCase();
            const res = await api.post("/auth/login", {
                email: email,
                password: password,
                role: role
            });

            if (res.data.user || res.data.role) {
                setSuccess(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Login successful!`);

                // Consistency in localStorage keys for existing dashboards
                localStorage.setItem('user_role', activeTab);
                if (res.data.token) {
                    localStorage.setItem('token', res.data.token);
                }

                if (activeTab === 'candidate') {
                    localStorage.removeItem('pendingVerificationEmail');
                    localStorage.setItem('candidate', JSON.stringify(res.data.user));
                    localStorage.setItem('currentUser', JSON.stringify(res.data.user));
                    window.dispatchEvent(new Event('auth-change'));
                    setTimeout(() => navigate("/candidates/welcome"), 1000);
                } else if (activeTab === 'hr') {
                    syncStoredHrUser(res.data.user);
                    window.dispatchEvent(new Event('auth-change'));
                    setTimeout(() => navigate("/hr/dashboard"), 1000);
                } else if (activeTab === 'admin') {
                    localStorage.setItem('admin_user', JSON.stringify(res.data.user));
                    window.dispatchEvent(new Event('auth-change'));
                    setTimeout(() => navigate("/admin/dashboard"), 1000);
                }
            } else {
                setError("Login failed. Please check your credentials.");
            }
        } catch (err) {
            console.error(err);
            const apiError = err.response?.data?.error || "Invalid credentials or server error.";
            setError(apiError);

            if (
                activeTab === 'candidate' &&
                err.response?.status === 403 &&
                email &&
                apiError.toLowerCase().includes('verify your email')
            ) {
                localStorage.setItem('pendingVerificationEmail', email.trim().toLowerCase());
                setTimeout(() => {
                    navigate(`/candidate/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`);
                }, 1200);
            }

            if (
                activeTab === 'hr' &&
                err.response?.status === 403 &&
                email &&
                apiError.toLowerCase().includes('verify your email')
            ) {
                setTimeout(() => {
                    navigate(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}&role=hr`);
                }, 1200);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="vh-login-wrapper">
            <div className="vh-login-background">
                <div className="vh-bg-shape vh-shape-1"></div>
                <div className="vh-bg-shape vh-shape-2"></div>
                <div className="vh-bg-shape vh-shape-3"></div>
            </div>

            <div className="vh-login-container">
                <div className="vh-login-content">
                    <div className="vh-login-left">
                        <div className="vh-brand-section">
                            <h1 className="vh-brand-title">VirtueHire</h1>
                            <p className="vh-brand-subtitle">Empowering Talent, Enabling Success</p>
                            
                            <div className="vh-brand-features">
                                <div className="vh-feature-item">
                                    <div className="vh-feature-icon">
                                        <Sparkles size={18} />
                                    </div>
                                    <span>AI-Powered Matching</span>
                                </div>
                                <div className="vh-feature-item">
                                    <div className="vh-feature-icon">
                                        <Zap size={18} />
                                    </div>
                                    <span>Seamless Hiring Process</span>
                                </div>
                                <div className="vh-feature-item">
                                    <div className="vh-feature-icon">
                                        <TrendingUp size={18} />
                                    </div>
                                    <span>Career Growth Analytics</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="vh-login-right">
                        <div className="vh-form-container">
                            <div className="vh-form-header">
                                <button type="button" className="vh-back-button" onClick={() => navigate('/landing')}>
                                    <ArrowLeft size={16} />
                                    Back
                                </button>
                                <div>
                                    <h2 className="vh-form-title">Welcome Back</h2>
                                    <p className="vh-form-subtitle">Sign in to your account</p>
                                </div>
                            </div>

                            <div className="vh-role-tabs">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('candidate')}
                                    className={`vh-role-tab ${activeTab === 'candidate' ? 'active' : ''}`}
                                >
                                    <UserCheck size={18} />
                                    <span>Candidate</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('hr')}
                                    className={`vh-role-tab ${activeTab === 'hr' ? 'active' : ''}`}
                                >
                                    <Users size={18} />
                                    <span>HR</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('admin')}
                                    className={`vh-role-tab ${activeTab === 'admin' ? 'active' : ''}`}
                                >
                                    <Shield size={18} />
                                    <span>Admin</span>
                                </button>
                            </div>

                            {error && <div className="vh-alert vh-alert-error">{error}</div>}
                            {success && <div className="vh-alert vh-alert-success">{success}</div>}

                            <form className="vh-form" onSubmit={handleLogin}>
                                <div className="vh-form-group">
                                    <label className="vh-label">Email Address</label>
                                    <div className="vh-input-wrapper">
                                        <Mail className="vh-input-icon" size={18} />
                                        <input
                                            type="email"
                                            className="vh-input"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="vh-form-group">
                                    <label className="vh-label">Password</label>
                                    <div className="vh-input-wrapper">
                                        <Lock className="vh-input-icon" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="vh-input"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="vh-password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="vh-submit-btn" disabled={loading}>
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </button>

                                {activeTab === 'candidate' && (
                                    <div className="vh-register-link">
                                        Don't have an account? <span onClick={() => navigate('/candidate-registration')}>Register Now</span>
                                    </div>
                                )}

                                {activeTab === 'hr' && (
                                    <>
                                        <div className="vh-register-link">
                                            HR module is free for 3 months. <span onClick={() => navigate('/hrs/register')}>Sign Up</span>
                                        </div>
                                        <div className="vh-register-link">
                                            Need renewal plans? <span onClick={() => navigate('/payments/plans?audience=hr')}>View Subscription Options</span>
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
