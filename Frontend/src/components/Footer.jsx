import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, GitBranch } from 'lucide-react';
import './Footer.css';

function TwitterIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon"><Zap size={14} strokeWidth={2.5} /></div>
              <span className="footer-logo-text">StudySphere</span>
            </Link>
            <p className="footer-tagline">
              Turn any syllabus into a structured learning journey.
            </p>
            <div className="footer-socials">
              <a href="#" className="footer-social-btn" aria-label="GitHub"><GitBranch size={16} /></a>
              <a href="#" className="footer-social-btn" aria-label="Twitter"><TwitterIcon size={16} /></a>
              <a href="#" className="footer-social-btn" aria-label="LinkedIn"><LinkedinIcon size={16} /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Product</h4>
            <ul className="footer-links">
              <li><Link to="/upload">Upload Syllabus</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><a href="#">Roadmaps</a></li>
              <li><a href="#">Quizzes</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-links">
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Legal</h4>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 StudySphere. All rights reserved.</span>
          <span className="footer-made">Built for learners, by learners.</span>
        </div>
      </div>
    </footer>
  );
}
