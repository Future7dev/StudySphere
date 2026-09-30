import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Auth.css';
import api from '../api/axios.js';
import GoogleLoginButton from '../components/GoogleLoginButton';
import GhostFibers from './GhostFibers';

const STEPS = ['Account', 'Profile', 'Interests'];
const INTERESTS = ['Web Development', 'Machine Learning', 'Data Structures', 'System Design', 'DevOps', 'Mobile Dev', 'Cybersecurity', 'Blockchain'];

export default function Signup() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '', password: '', name: '', interests: [],
  });

  const toggleInterest = (i) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i]
    }));
  };

  const handleNext = () => {
    setError('');
    if (step === 0) {
      if (!form.email || !form.password) { setError('Fill in all fields.'); return; }
      if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    }
    if (step === 1 && !form.name.trim()) { setError('Please enter your name.'); return; }
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post("/auth/register", form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      dispatch({ type: 'SIGNUP', payload: res.data });
      setLoading(false);
      navigate('/dashboard');
    }
    catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Registration failed');
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
              "I uploaded my Data Science syllabus and had a full roadmap with YouTube resources in under 2 minutes."
            </blockquote>
            <div className="auth-quote-author">
              <div className="auth-quote-avatar">P</div>
              <div>
                <div className="auth-quote-name">Priya Nair</div>
                <div className="auth-quote-role">CS Student, IIT Delhi</div>
              </div>
            </div>
          </div>
          <div className="auth-left-stats">
            {[['50K+', 'Learners'], ['1M+', 'Topics'], ['Free', 'Forever']].map(([v, l]) => (
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
          {/* Steps indicator */}
          <div className="signup-steps">
            {STEPS.map((s, i) => (
              <div key={s} className={`signup-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                <div className="signup-step-dot">
                  {i < step ? <Check size={10} strokeWidth={3} /> : <span>{i + 1}</span>}
                </div>
                <span className="signup-step-label">{s}</span>
                {i < STEPS.length - 1 && <div className="signup-step-line" />}
              </div>
            ))}
          </div>

          <div className="auth-form-header">
            <h1 className="auth-form-title font-display">
              {step === 0 ? 'Create account' : step === 1 ? 'About you' : 'Your interests'}
            </h1>
            <p className="auth-form-sub">
              {step === 0 ? 'Start your learning journey today.' : step === 1 ? 'Tell us a bit about yourself.' : 'Select topics you want to learn.'}
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-form">
            {step === 0 && (
              <>
                <div className="form-group">
                  <label className="label" htmlFor="signup-email">Email address</label>
                  <input id="signup-email" type="email" className="input" placeholder="you@example.com"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="signup-pw">Password</label>
                  <div className="auth-pw-input">
                    <input id="signup-pw" type={showPw ? 'text' : 'password'} className="input"
                      placeholder="Min 8 characters" value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                    <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {form.password.length > 0 && (
                    <div className="pw-strength">
                      <div className="pw-strength-bar">
                        {[0, 1, 2].map(i => (
                          <div key={i} className={`pw-strength-seg ${form.password.length > i * 4 ? 'filled' : ''}`} />
                        ))}
                      </div>
                      <span className="pw-strength-label">
                        {form.password.length < 4 ? 'Weak' : form.password.length < 8 ? 'Fair' : 'Strong'}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="form-group">
                  <label className="label" htmlFor="signup-name">Full name</label>
                  <input id="signup-name" type="text" className="input" placeholder="Alex Sharma"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="signup-role">I am a...</label>
                  <select id="signup-role" className="input">
                    <option value="">Select your role</option>
                    <option>Student</option>
                    <option>Self-taught developer</option>
                    <option>Professional upskilling</option>
                    <option>Educator</option>
                  </select>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="interest-grid">
                {INTERESTS.map(interest => (
                  <button key={interest} type="button"
                    className={`interest-chip ${form.interests.includes(interest) ? 'selected' : ''}`}
                    onClick={() => toggleInterest(interest)}>
                    {form.interests.includes(interest) && <Check size={12} strokeWidth={3} />}
                    {interest}
                  </button>
                ))}
              </div>
            )}

            <button type="button" className="btn btn-primary w-full btn-lg auth-submit" onClick={handleNext} disabled={loading}>
              {loading ? <span className="auth-spinner" /> : step < STEPS.length - 1 ? <>Continue <ArrowRight size={16} /></> : <>Create account <ArrowRight size={16} /></>}
            </button>

            {step > 0 && (
              <button type="button" className="btn btn-ghost w-full" onClick={() => setStep(s => s - 1)}>Back</button>
            )}
          </div>

          {step === 0 && (
            <>
              <div className="auth-divider"><span>or continue with</span></div>
              <div className="auth-socials">
                <GoogleLoginButton text="Sign up with Google" onError={(msg) => setError(msg)} />
                <button key="GitHub" className="btn btn-secondary w-full auth-social-btn" type="button" onClick={() => setError('GitHub sign up coming soon!')}>
                  <span className="auth-social-icon">⚫</span>
                  <span>GitHub</span>
                </button>
              </div>
            </>
          )}

          <p className="auth-switch">
            Already have an account? <Link to="/login" className="auth-switch-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
