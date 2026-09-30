import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Upload, Map, Brain, BarChart2, CheckCircle2, Zap,
  Star, Sparkles, Shield, Clock, Play, ChevronRight, BookOpen,
  TrendingUp, Code, Layers
} from 'lucide-react';
import Footer from '../components/Footer';
import GradientWaves from './GradientWaves';
import './Landing.css';

const features = [
  {
    icon: Upload,
    title: 'Upload Any Content',
    description: 'Drop a PDF, DOCX, paste text, or just type a topic name. Our AI structures it into a comprehensive learning plan.',
    gradient: 'from-violet-500 to-indigo-500',
    color: 'var(--primary-light)',
    bg: 'var(--primary-dim)',
    border: 'var(--primary-border)',
  },
  {
    icon: Map,
    title: 'Visual Roadmaps',
    description: 'Every topic becomes a beautifully structured node-based roadmap with clear milestones and logical learning sequences.',
    gradient: 'from-emerald-500 to-teal-500',
    color: 'var(--success)',
    bg: 'var(--success-dim)',
    border: 'rgba(16,185,129,0.2)',
  },
  {
    icon: Play,
    title: 'Curated Resources',
    description: 'Each subtopic gets hand-picked YouTube videos, articles, and documentation links sourced from the web.',
    gradient: 'from-amber-500 to-orange-500',
    color: 'var(--gold)',
    bg: 'var(--gold-dim)',
    border: 'rgba(245,158,11,0.2)',
  },
  {
    icon: BarChart2,
    title: 'Progress Tracking',
    description: 'Visual progress rings and completion indicators keep you motivated and aware of exactly where you stand.',
    gradient: 'from-purple-500 to-pink-500',
    color: 'var(--purple)',
    bg: 'var(--purple-dim)',
    border: 'rgba(168,85,247,0.2)',
  },
  {
    icon: Brain,
    title: 'AI Quizzes',
    description: 'Auto-generated multiple choice quizzes per topic test your understanding and reinforce what you learn.',
    gradient: 'from-cyan-500 to-blue-500',
    color: 'var(--cyan)',
    bg: 'var(--cyan-dim)',
    border: 'rgba(34,211,238,0.2)',
  },
  {
    icon: TrendingUp,
    title: 'Smart Dashboard',
    description: 'All your syllabi, progress metrics, streaks, and quiz scores consolidated in one intelligent dashboard.',
    gradient: 'from-rose-500 to-red-500',
    color: '#F87171',
    bg: 'rgba(248,113,113,0.10)',
    border: 'rgba(248,113,113,0.2)',
  },
];

const stats = [
  { value: '50K+', label: 'Active learners', icon: '👩‍🎓' },
  { value: '2.4M+', label: 'Topics studied', icon: '📚' },
  { value: '98%', label: 'Completion rate', icon: '✅' },
  { value: '4.9★', label: 'Avg rating', icon: '⭐' },
];

const testimonials = [
  {
    name: 'Priya Nair',
    role: 'CS Student, IIT Delhi',
    text: 'I uploaded my entire semester syllabus and had a full roadmap in seconds. The YouTube video curation alone saved me hours of research.',
    avatar: 'PN',
    tag: 'Student',
  },
  {
    name: 'Rahul Mehta',
    role: 'Backend Engineer → ML',
    text: 'Using StudySphere to transition into Machine Learning. The structured roadmap and adaptive quizzes keep me honest about what I actually know.',
    avatar: 'RM',
    tag: 'Professional',
  },
  {
    name: 'Aisha Khan',
    role: 'Self-taught Developer',
    text: 'Finally a learning tool that doesn\'t feel like a toy. The UI is clean and professional, and the roadmaps are incredibly thorough.',
    avatar: 'AK',
    tag: 'Developer',
  },
];

const howSteps = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload your syllabus',
    desc: 'Drag and drop a PDF, DOCX or simply type any topic or subject name. We handle the rest.',
  },
  {
    step: '02',
    icon: Layers,
    title: 'Get your roadmap',
    desc: 'A structured, visual learning path appears in seconds with curated videos, articles, and resources.',
  },
  {
    step: '03',
    icon: TrendingUp,
    title: 'Learn & track progress',
    desc: 'Work through topics, watch curated lectures, take quizzes, and watch your mastery grow.',
  },
];

export default function Landing() {
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
      heroRef.current.style.setProperty('--mx', `${x}%`);
      heroRef.current.style.setProperty('--my', `${y}%`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="landing">

      {/* ── Navbar ── */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo">
            <div className="landing-logo-mark">
              <Zap size={14} strokeWidth={2.5} />
            </div>
            <span className="landing-logo-text">StudySphere</span>
            <span className="landing-logo-badge">Beta</span>
          </Link>

          <nav className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#how-it-works" className="landing-nav-link">How it works</a>
            <a href="#testimonials" className="landing-nav-link">Reviews</a>
          </nav>

          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              Start free <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero" ref={heroRef}>
        {/* GradientWaves background */}
        <div className="hero-gradient-waves-bg">
          <GradientWaves
            horizonColor="#ae285d"
            waveColor="#842e45"
            crestColor="#f7e9e9"
            speed={0.4}
            amplitude={2.5}
            waveScale={0.6}
            waveRatio={0.9}
            swell={35}
            turbulence={20}
            tilt={1.11}
            zoom={1}
            height={5.5}
            fogDepth={15}
            detail="medium"
            brightness={1}
            opacity={1}
            mouseInteraction
            parallaxStrength={0.5}
            grain
            grainIntensity={0.05}
          />
        </div>

        <div className="hero-container">
          {/* Badge */}
          <div className="hero-eyebrow animate-in">
            <div className="hero-eyebrow-pill">
              <Sparkles size={12} />
              <span>AI-Powered Learning Platform</span>
            </div>
            <div className="hero-eyebrow-trust">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill="var(--gold)" color="var(--gold)" />
              ))}
              <span>50K+ learners</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="hero-title font-display animate-in" style={{ animationDelay: '80ms' }}>
            Turn your syllabus into
            <br />
            <span className="hero-title-highlight">a mastery roadmap</span>
          </h1>

          <p className="hero-subtitle animate-in" style={{ animationDelay: '160ms' }}>
            Upload any PDF, DOCX, or topic name. StudySphere generates a structured learning roadmap,
            curates YouTube lectures & articles, and tracks your progress — all in one premium experience.
          </p>

          {/* CTA */}
          <div className="hero-cta animate-in" style={{ animationDelay: '240ms' }}>
            <Link to="/signup" className="btn btn-primary btn-xl hero-btn-primary">
              <Zap size={18} strokeWidth={2.5} />
              Start learning free
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign in
            </Link>
          </div>

          <div className="hero-trust animate-in" style={{ animationDelay: '320ms' }}>
            <span className="hero-trust-item"><CheckCircle2 size={13} /> No credit card</span>
            <span className="hero-trust-sep" />
            <span className="hero-trust-item"><CheckCircle2 size={13} /> Free forever plan</span>
            <span className="hero-trust-sep" />
            <span className="hero-trust-item"><CheckCircle2 size={13} /> Setup in 30 seconds</span>
          </div>
        </div>

        {/* Hero product visual */}
        <div className="hero-visual-section animate-in" style={{ animationDelay: '400ms' }}>
          <div className="hero-visual-glow" />
          <div className="hero-product-card">
            {/* Window chrome */}
            <div className="hero-product-chrome">
              <div className="hero-chrome-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <div className="hero-chrome-title">Full-Stack Web Development — Roadmap</div>
              <span className="badge badge-success" style={{ marginLeft: 'auto' }}>42% complete</span>
            </div>

            {/* Content */}
            <div className="hero-product-body">
              {/* Sidebar */}
              <div className="hero-product-sidebar">
                <div className="hero-sidebar-section-label">Learning sections</div>
                {['HTML & CSS', 'JavaScript', 'React', 'Node.js', 'Databases', 'DevOps'].map((item, i) => (
                  <div key={item} className={`hero-sidebar-item ${i < 2 ? 'done' : i === 2 ? 'active' : ''}`}>
                    <div className={`hero-sidebar-dot ${i < 2 ? 'done' : i === 2 ? 'active' : ''}`} />
                    <span>{item}</span>
                    {i < 2 && <CheckCircle2 size={12} className="hero-sidebar-check" />}
                    {i === 2 && <div className="hero-sidebar-pill">In progress</div>}
                  </div>
                ))}
              </div>

              {/* Main area */}
              <div className="hero-product-main">
                <div className="hero-main-header">
                  <h3>React Framework</h3>
                  <div className="hero-main-pills">
                    <span className="badge badge-primary">In progress</span>
                    <span className="badge badge-muted">6 topics</span>
                  </div>
                </div>
                <div className="hero-video-card">
                  <div className="hero-video-thumb">
                    <Play size={22} fill="white" color="white" />
                  </div>
                  <div className="hero-video-info">
                    <div className="hero-video-title">React Hooks Deep Dive</div>
                    <div className="hero-video-meta">YouTube · 28 min</div>
                  </div>
                </div>
                <div className="hero-progress-row">
                  <span>Section progress</span>
                  <span>3 / 6 complete</span>
                </div>
                <div className="progress-track" style={{ height: '6px' }}>
                  <div className="progress-fill" style={{ width: '50%' }} />
                </div>
                <div className="hero-topics-label">Topics</div>
                <div className="hero-topics">
                  {['Components & JSX', 'State & Props', 'Hooks', 'Router v6', 'Context API', 'Performance'].map((t, i) => (
                    <div key={t} className={`hero-topic-chip ${i < 3 ? 'done' : ''}`}>
                      {i < 3 && <CheckCircle2 size={11} />}
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <div className="hero-float-card hero-float-quiz animate-float" style={{ animationDelay: '1s' }}>
            <Brain size={16} color="var(--cyan)" />
            <div>
              <div className="hero-float-title">Quiz complete</div>
              <div className="hero-float-sub">Score: 92% · Excellent!</div>
            </div>
          </div>
          <div className="hero-float-card hero-float-streak animate-float" style={{ animationDelay: '0.5s' }}>
            <span className="hero-float-emoji">🔥</span>
            <div>
              <div className="hero-float-title">7-day streak</div>
              <div className="hero-float-sub">Keep going!</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map(({ value, label, icon }) => (
              <div key={label} className="stat-card">
                <div className="stat-icon">{icon}</div>
                <div className="stat-value font-display">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section features-section" id="features">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">
              <Sparkles size={12} />
              <span>Platform Features</span>
            </div>
            <h2 className="section-title font-display">
              Everything you need to
              <br />
              <span className="gradient-text">learn deeply</span>
            </h2>
            <p className="section-sub">
              Not just a list of links. A full learning system intelligently built around your content.
            </p>
          </div>

          <div className="features-grid">
            {features.map(({ icon: Icon, title, description, color, bg, border }, i) => (
              <div
                className="feature-card card card-interactive"
                key={title}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="feature-card-top">
                  <div
                    className="feature-icon-wrap"
                    style={{ background: bg, border: `1px solid ${border}`, color }}
                  >
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-desc">{description}</p>
                <div className="feature-footer" style={{ color }}>
                  <span>Learn more</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section how-section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">
              <BookOpen size={12} />
              <span>How it works</span>
            </div>
            <h2 className="section-title font-display">
              From upload to mastery
              <br />
              <span className="gradient-text-warm">in three steps</span>
            </h2>
          </div>

          <div className="how-steps">
            {howSteps.map(({ step, icon: Icon, title, desc }, i) => (
              <div key={step} className="how-step">
                <div className="how-step-number-wrap">
                  <div className="how-step-number font-display">{step}</div>
                  {i < howSteps.length - 1 && <div className="how-step-connector" />}
                </div>
                <div className="how-step-icon-wrap">
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="how-step-title">{title}</h3>
                <p className="how-step-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section testimonials-section" id="testimonials">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">
              <Star size={12} fill="var(--gold)" color="var(--gold)" />
              <span>Testimonials</span>
            </div>
            <h2 className="section-title font-display">
              Loved by learners
              <br />
              <span className="gradient-text">around the world</span>
            </h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map(({ name, role, text, avatar, tag }) => (
              <div key={name} className="testimonial-card card">
                <div className="testimonial-header">
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="var(--gold)" color="var(--gold)" />
                    ))}
                  </div>
                  <span className="badge badge-primary testimonial-tag">{tag}</span>
                </div>
                <blockquote className="testimonial-text">"{text}"</blockquote>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{avatar}</div>
                  <div className="testimonial-meta">
                    <div className="testimonial-name">{name}</div>
                    <div className="testimonial-role">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-bg-glow" />
            <div className="cta-bg-grid" />
            <div className="cta-content">
              <div className="cta-eyebrow">
                <Zap size={14} />
                <span>Start today — it's free</span>
              </div>
              <h2 className="cta-title font-display">
                Ready to learn
                <br />
                <span className="gradient-text">smarter?</span>
              </h2>
              <p className="cta-sub">
                Join 50,000+ learners who turned their syllabi into structured, trackable learning journeys.
              </p>
              <div className="cta-actions">
                <Link to="/signup" className="btn btn-primary btn-xl cta-btn-main">
                  <Zap size={18} strokeWidth={2.5} />
                  Create free account
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  I already have an account
                </Link>
              </div>
              <div className="cta-trust">
                <div className="cta-trust-item"><Shield size={13} /> Privacy-first</div>
                <div className="cta-trust-item"><Zap size={13} /> No card required</div>
                <div className="cta-trust-item"><Clock size={13} /> 30-second setup</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
