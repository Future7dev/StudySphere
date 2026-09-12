import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, ArrowRight, BookOpen, Clock, TrendingUp, Flame, CheckCircle2, Circle, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import ProgressRing from '../components/ProgressRing';
import Footer from '../components/Footer';
import { weeklyActivity } from '../data/mockData';
import './Dashboard.css';

function ActivityBar({ day, minutes, max }) {
  const pct = (minutes / max) * 100;
  return (
    <div className="activity-bar-col">
      <div className="activity-bar-track">
        <div className="activity-bar-fill" style={{ height: `${pct}%` }} />
      </div>
      <span className="activity-bar-day">{day}</span>
    </div>
  );
}

export default function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { uploadedSyllabi, user, quizResults } = state;

  const totalProgress = uploadedSyllabi.length > 0
    ? Math.round(uploadedSyllabi.reduce((a, b) => a + (b.progress || 0), 0) / uploadedSyllabi.length)
    : 0;
  const maxActivity = Math.max(...weeklyActivity.map(d => d.minutes));


  const getStatusIcon = (progress) => {
    if (progress === 100) return <CheckCircle2 size={14} className="ds-status-icon done" />;
    if (progress > 0) return <Loader size={14} className="ds-status-icon active" />;
    return <Circle size={14} className="ds-status-icon pending" />;
  };

  return (
    <div className="page-layout">
      <Navbar />
      <main className="dashboard animate-in">
        <div className="container">
          {/* ── Header */}
          <div className="ds-header">
            <div>
              <h1 className="ds-greeting font-display">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
                <span className="ds-name">{user.name.split(' ')[0]}</span> 👋
              </h1>
              <p className="ds-sub">Here's your learning overview for today.</p>
            </div>
            <Link to="/upload" className="btn btn-primary">
              <Upload size={15} /> New syllabus
            </Link>
          </div>

          {/* ── Stats Row */}
          <div className="ds-stats">
            <div className="ds-stat-card card">
              <div className="ds-stat-label">Overall Progress</div>
              <div className="ds-stat-main">
                <ProgressRing progress={totalProgress} size={72} strokeWidth={5} />
              </div>
            </div>
            <div className="ds-stat-card card">
              <div className="ds-stat-label">Study Streak</div>
              <div className="ds-stat-main">
                <div className="ds-big-number font-display">{user.streak}</div>
                <div className="ds-stat-unit">days 🔥</div>
              </div>
            </div>
            <div className="ds-stat-card card">
              <div className="ds-stat-label">Topics Completed</div>
              <div className="ds-stat-main">
                <div className="ds-big-number font-display">{user.totalTopicsCompleted}</div>
                <div className="ds-stat-unit">of all topics</div>
              </div>
            </div>
            <div className="ds-stat-card card">
              <div className="ds-stat-label">Quiz Average</div>
              <div className="ds-stat-main">
                <div className="ds-big-number font-display">{user.averageQuizScore}</div>
                <div className="ds-stat-unit">out of 100</div>
              </div>
            </div>
          </div>

          {/* ── Main Grid */}
          <div className="ds-main-grid">
            {/* Left: Syllabi */}
            <div className="ds-col-main">
              <div className="ds-section-header">
                <h2 className="ds-section-title">Your Syllabi</h2>
                <Link to="/upload" className="ds-section-action">
                  <Upload size={13} /> Add new
                </Link>
              </div>

              <div className="ds-syllabi-list">
                {uploadedSyllabi.map((s, i) => (
                  <div
                    key={s.id}
                    className="ds-syllabus-card card card-interactive"
                    onClick={() => navigate(`/roadmap/${s.id}`)}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="ds-syllabus-left">
                      <div className="ds-syllabus-icon" style={{ background: `hsl(${i * 80 + 240},60%,25%)`, border: `1px solid hsl(${i * 80 + 240},60%,35%)` }}>
                        <BookOpen size={18} style={{ color: `hsl(${i * 80 + 240},80%,65%)` }} />
                      </div>
                      <div>
                        <div className="ds-syllabus-title">{s.title}</div>
                        <div className="ds-syllabus-meta">
                          <Clock size={11} /> Uploaded {s.uploadedAt}
                          &nbsp;·&nbsp;
                          {getStatusIcon(s.progress)}
                          &nbsp;{s.progress < 100 ? `${s.progress}% done` : 'Completed'}
                        </div>
                      </div>
                    </div>
                    <div className="ds-syllabus-right">
                      <div className="ds-syllabus-progress">
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${s.progress}%` }} />
                        </div>
                        <span className="ds-syllabus-pct">{s.progress}%</span>
                      </div>
                      <ArrowRight size={14} className="ds-syllabus-arrow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Activity + Quiz results */}
            <div className="ds-col-side">
              {/* Weekly Activity */}
              <div className="ds-widget card">
                <div className="ds-widget-header">
                  <h3 className="ds-widget-title">
                    <TrendingUp size={14} /> Weekly Activity
                  </h3>
                  <span className="ds-widget-sub">minutes/day</span>
                </div>
                <div className="activity-bars">
                  {weeklyActivity.map(({ day, minutes }) => (
                    <ActivityBar key={day} day={day} minutes={minutes} max={maxActivity} />
                  ))}
                </div>
              </div>

              {/* Streak badge */}
              <div className="ds-streak-card card">
                <div className="ds-streak-icon">🔥</div>
                <div>
                  <div className="ds-streak-val font-display">{user.streak}-day streak</div>
                  <div className="ds-streak-sub">Keep it going — you're on fire!</div>
                </div>
              </div>

              {/* Recent quizzes */}
              {quizResults.length > 0 && (
                <div className="ds-widget card">
                  <div className="ds-widget-header">
                    <h3 className="ds-widget-title">Recent Quizzes</h3>
                  </div>
                  {quizResults.slice(0, 3).map((r, i) => (
                    <div key={i} className="ds-quiz-result">
                      <span className="ds-quiz-name">{r.title}</span>
                      <span className={`badge ${r.score >= 80 ? 'badge-success' : r.score >= 50 ? 'badge-primary' : 'badge-error'}`}>
                        {r.score}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Badges */}
              <div className="ds-widget card">
                <div className="ds-widget-header">
                  <h3 className="ds-widget-title">Badges</h3>
                  <Link to="/profile" className="ds-section-action">View all</Link>
                </div>
                <div className="ds-badges-row">
                  {user.badges.filter(b => b.earned).map(b => (
                    <div key={b.id} className="ds-badge-item" title={b.description}>
                      <span>{b.icon}</span>
                      <span className="ds-badge-name">{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
