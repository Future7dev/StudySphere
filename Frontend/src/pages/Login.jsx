import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Auth.css';
import api from '../api/axios.js';
import GoogleLoginButton from '../components/GoogleLoginButton';
import GhostFibers from './GhostFibers';

export default function Login() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      dispatch({ type: 'LOGIN', payload: res.data });
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* GhostFibers full-page background */}
      <div className="auth-fibers-bg">
        <GhostFibers
          lineColor="#350e19"
          glowColor="#a03454"
          speed={0.2}
          scale={2}
          rotation={0}
          rotationSpeed={0.25}
          layers={4}
          waveAmplitude={0.015}
          waveFrequency={3}
          waveSpeed={0.15}
          layerSpeed={0.08}
          twist={0.1}
          twistFrequency={5}
          twistSpeed={1.2}
          lineFrequency={5}
          lineSpacing={2}
          lineSharpness={16}
          glowFalloff={10}
          glowIntensity={1.6}
          brightness={2}
          blueBoost={1.25}
          vignette={0.8}
          grain={0.05}
          dpr={1}
          lightMode={false}
          fps={60}
          paused={false}
        />
      </div>

      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon"><Zap size={16} strokeWidth={2.5} /></div>
            <span>StudySphere</span>
          </Link>
          <div className="auth-left-quote">
            <blockquote>
              "StudySphere turned my 80-page university syllabus into a clear, trackable learning plan in under a minute."
            </blockquote>
            <div className="auth-quote-author">
              <div className="auth-quote-avatar">R</div>
              <div>
                <div className="auth-quote-name">Rahul Mehta</div>
                <div className="auth-quote-role">Backend Engineer</div>
              </div>
            </div>
          </div>
          <div className="auth-left-stats">
            {[['50K+', 'Learners'], ['1M+', 'Topics'], ['4.9★', 'Rating']].map(([v, l]) => (
              <div key={l} className="auth-stat">
                <span className="auth-stat-value">{v}</span>
                <span className="auth-stat-label">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap animate-in">
          <div className="auth-form-header">
            <h1 className="auth-form-title font-display">Welcome back</h1>
            <p className="auth-form-sub">Sign in to continue your learning journey.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <div className="auth-pw-label">
                <label className="label" htmlFor="login-password">Password</label>
                <Link to="#" className="auth-forgot">Forgot password?</Link>
              </div>
              <div className="auth-pw-input">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="auth-divider"><span>or continue with</span></div>
          <div className="auth-socials">
            <GoogleLoginButton onError={(msg) => setError(msg)} />
            <button key="GitHub" className="btn btn-secondary w-full auth-social-btn" type="button" onClick={() => setError('GitHub authentication coming soon!')}>
              <span className="auth-social-icon">⚫</span>
              <span>GitHub</span>
            </button>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup" className="auth-switch-link">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
