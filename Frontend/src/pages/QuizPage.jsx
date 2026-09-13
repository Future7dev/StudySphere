import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { quizzes } from '../data/mockData';
import './QuizPage.css';

function ResultsScreen({ quiz, answers, onRetry, onContinue }) {
  const correct = answers.filter((a, i) => a === quiz.questions[i].correctIndex).length;
  const score = Math.round((correct / quiz.questions.length) * 100);
  const isPassed = score >= 60;

  return (
    <div className="quiz-results animate-scale">
      <div className={`quiz-result-badge ${isPassed ? 'pass' : 'fail'}`}>
        {isPassed ? <Trophy size={36} /> : <XCircle size={36} />}
      </div>
      <h2 className="quiz-result-title font-display">
        {score >= 90 ? 'Outstanding!' : score >= 70 ? 'Well done!' : score >= 60 ? 'You passed!' : 'Keep practicing'}
      </h2>
      <div className="quiz-result-score font-display">{score}%</div>
      <p className="quiz-result-sub">{correct} / {quiz.questions.length} correct answers</p>

      <div className="quiz-answers-review">
        {quiz.questions.map((q, i) => {
          const isCorrect = answers[i] === q.correctIndex;
          return (
            <div key={q.id} className={`quiz-review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="quiz-review-header">
                <div className="quiz-review-icon">
                  {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                </div>
                <span className="quiz-review-q">Q{i + 1}. {q.question}</span>
              </div>
              <div className="quiz-review-answer">
                <span className="quiz-review-your">Your answer: {answers[i] !== null ? q.options[answers[i]] : 'Skipped'}</span>
                {!isCorrect && <span className="quiz-review-correct">Correct: {q.options[q.correctIndex]}</span>}
                <span className="quiz-review-exp">{q.explanation}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="quiz-result-actions">
        <button className="btn btn-secondary" onClick={onRetry}>
          <RotateCcw size={15} /> Retry quiz
        </button>
        <button className="btn btn-primary" onClick={onContinue}>
          Continue learning <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

import API from '../api/axios';

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, fetchDashboardData } = useApp();

  const [quiz, setQuiz] = useState(() => {
    const rm = (state.roadmaps || []).find(r => r.slug === id || r.id === id || r._id === id);
    if (rm && rm.quiz && rm.quiz.questions && rm.quiz.questions.length > 0) {
      return rm.quiz;
    }
    return quizzes[id] || quizzes['javascript'];
  });

  const [phase, setPhase] = useState('quiz'); // 'quiz' | 'results'
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(new Array(quiz.questions.length).fill(null));
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(quiz.timePerQuestion || 30);
  const [showFeedback, setShowFeedback] = useState(false);
  const timerRef = useRef(null);

  // Fetch quiz from backend if available
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await API.get(`/roadmaps/${id}/quiz`);
        if (res.data && res.data.questions && res.data.questions.length > 0) {
          setQuiz(res.data);
          setAnswers(new Array(res.data.questions.length).fill(null));
          setTimeLeft(res.data.timePerQuestion || 30);
        }
      } catch (err) {
        // Keep fallback quiz
      }
    };
    fetchQuiz();
  }, [id]);

  const q = quiz.questions[current] || quiz.questions[0];
  const isLastQuestion = current === quiz.questions.length - 1;

  useEffect(() => {
    if (phase !== 'quiz' || showFeedback) return;
    setTimeLeft(quiz.timePerQuestion || 30);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, phase, showFeedback]);

  const handleTimeUp = () => {
    setShowFeedback(true);
    clearInterval(timerRef.current);
  };

  const handleSelect = (optIdx) => {
    if (showFeedback || selected !== null) return;
    clearInterval(timerRef.current);
    setSelected(optIdx);
    const newAnswers = [...answers];
    newAnswers[current] = optIdx;
    setAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleNext = async () => {
    setShowFeedback(false);
    setSelected(null);
    if (isLastQuestion) {
      const correct = answers.filter((a, i) => a === quiz.questions[i].correctIndex).length;
      const score = Math.round((correct / quiz.questions.length) * 100);
      dispatch({
        type: 'SAVE_QUIZ_RESULT',
        payload: { title: quiz.title, score, date: new Date().toLocaleDateString() },
      });

      // Submit to backend
      try {
        await API.post(`/roadmaps/${id}/quiz/submit`, { answers });
        if (fetchDashboardData) fetchDashboardData();
      } catch (e) {
        console.warn('Quiz submit sync note:', e.message);
      }

      setPhase('results');
    } else {
      setCurrent(c => c + 1);
    }
  };


  const handleRetry = () => {
    setPhase('quiz');
    setCurrent(0);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setSelected(null);
    setShowFeedback(false);
  };

  const timePct = (timeLeft / quiz.timePerQuestion) * 100;
  const progressPct = ((current + (showFeedback ? 1 : 0)) / quiz.questions.length) * 100;

  if (phase === 'results') {
    return (
      <div className="page-layout">
        <Navbar />
        <main className="quiz-page">
          <div className="container container-sm">
            <ResultsScreen
              quiz={quiz}
              answers={answers}
              onRetry={handleRetry}
              onContinue={() => navigate(`/topic/${quiz.topicId}`)}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Navbar />
      <main className="quiz-page animate-in">
        <div className="container container-sm">
          {/* Header */}
          <div className="quiz-header">
            <button className="rm-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={15} /> Back
            </button>
            <h1 className="quiz-title font-display">{quiz.title}</h1>
          </div>

          {/* Progress */}
          <div className="quiz-top-bar">
            <div className="quiz-progress-info">
              <span className="quiz-q-count">{current + 1} / {quiz.questions.length}</span>
            </div>
            <div className="quiz-top-progress">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            <div className={`quiz-timer ${timeLeft <= 5 ? 'danger' : ''}`}>
              <Clock size={13} />
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* Timer bar */}
          <div className="quiz-time-track">
            <div
              className={`quiz-time-fill ${timeLeft <= 5 ? 'danger' : ''}`}
              style={{ width: `${timePct}%`, transition: 'width 1s linear' }}
            />
          </div>

          {/* Question card */}
          <div className="quiz-card card animate-scale" key={current}>
            <div className="quiz-q-label">Question {current + 1}</div>
            <h2 className="quiz-question">{q.question}</h2>

            <div className="quiz-options">
              {q.options.map((opt, i) => {
                let state = 'default';
                if (showFeedback) {
                  if (i === q.correctIndex) state = 'correct';
                  else if (i === selected && selected !== q.correctIndex) state = 'wrong';
                } else if (i === selected) state = 'selected';
                return (
                  <button
                    key={i}
                    className={`quiz-option ${state}`}
                    onClick={() => handleSelect(i)}
                    disabled={showFeedback}
                  >
                    <div className="quiz-option-letter">{String.fromCharCode(65 + i)}</div>
                    <span>{opt}</span>
                    {showFeedback && i === q.correctIndex && <CheckCircle2 size={15} className="quiz-opt-icon correct-icon" />}
                    {showFeedback && i === selected && selected !== q.correctIndex && <XCircle size={15} className="quiz-opt-icon wrong-icon" />}
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <div className={`quiz-feedback ${selected === q.correctIndex ? 'correct' : 'wrong'}`}>
                <div className="quiz-feedback-icon">
                  {selected === q.correctIndex ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </div>
                <div>
                  <div className="quiz-feedback-title">{selected === q.correctIndex ? 'Correct!' : 'Incorrect'}</div>
                  <div className="quiz-feedback-text">{q.explanation}</div>
                </div>
              </div>
            )}
          </div>

          {showFeedback && (
            <div className="quiz-next-row">
              <button className="btn btn-primary btn-lg quiz-next-btn" onClick={handleNext}>
                {isLastQuestion ? 'See results' : 'Next question'}
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
