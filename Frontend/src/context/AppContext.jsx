import React, { createContext, useContext, useReducer } from 'react';
import { roadmaps, userProfile } from '../data/mockData';
import API from '../api/axios';

const AppContext = createContext(null);


const savedUser = (() => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();
const hasToken = !!localStorage.getItem('token');

const initialState = {
  user: savedUser ? { ...userProfile, ...savedUser } : userProfile,
  isAuthenticated: hasToken,
  roadmaps: roadmaps,
  topicProgress: {
    'html-basics': 'completed', 'css-basics': 'completed',
    'flexbox': 'completed', 'responsive': 'completed',
    'js-vars': 'completed', 'js-functions': 'completed',
    'js-async': 'in-progress',
    'react-basics': 'in-progress',
    'math-foundations': 'completed',
    'linear-algebra': 'completed', 'calculus': 'completed',
    'probability': 'in-progress',
    'numpy': 'completed',
    'matplotlib': 'in-progress',
    'array-basics': 'completed', 'two-pointer': 'completed', 'sliding-window': 'completed',
    'll-basics': 'completed', 'll-ops': 'in-progress',
  },
  uploadedSyllabi: [
    { id: 'web-dev', title: 'Full-Stack Web Development', uploadedAt: '2026-08-10', progress: 42 },
    { id: 'ml-ai',  title: 'Machine Learning & AI',      uploadedAt: '2026-08-15', progress: 28 },
    { id: 'dsa',    title: 'Data Structures & Algorithms',uploadedAt: '2026-08-20', progress: 35 },
  ],
  quizResults: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true, user: { ...state.user, ...action.payload } };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { ...state, isAuthenticated: false, user: userProfile };
    case 'SIGNUP':
      return { ...state, isAuthenticated: true, user: { ...state.user, ...action.payload } };
    case 'SET_ROADMAPS':
      return { ...state, roadmaps: action.payload };
    case 'ADD_ROADMAP':
      return {
        ...state,
        roadmaps: [action.payload, ...state.roadmaps.filter(r => r.id !== action.payload.id && r.slug !== action.payload.slug)],
      };
    case 'SET_USER_DATA':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'MARK_TOPIC':
      return {
        ...state,
        topicProgress: { ...state.topicProgress, [action.payload.id]: action.payload.status },
      };
    case 'SET_TOPIC_PROGRESS':
      return {
        ...state,
        topicProgress: { ...state.topicProgress, ...action.payload },
      };
    case 'ADD_SYLLABUS':
      return {
        ...state,
        uploadedSyllabi: [
          action.payload,
          ...state.uploadedSyllabi.filter(s => s.id !== action.payload.id),
        ],
      };
    case 'DELETE_SYLLABUS':
      return {
        ...state,
        uploadedSyllabi: state.uploadedSyllabi.filter(s => s.id !== action.payload),
        roadmaps: (state.roadmaps || []).filter(
          r => r.id !== action.payload && r.slug !== action.payload && r._id !== action.payload
        ),
      };
    case 'UPDATE_SYLLABUS_PROGRESS':
      return {
        ...state,
        uploadedSyllabi: state.uploadedSyllabi.map(s =>
          s.id === action.payload.id ? { ...s, progress: action.payload.progress } : s
        ),
      };
    case 'SAVE_QUIZ_RESULT':
      return { ...state, quizResults: [action.payload, ...state.quizResults] };
    default:
      return state;
  }
}


export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Sync user dashboard and roadmaps from backend
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await API.get('/roadmaps/user/dashboard-summary');
        if (res.data.syllabi && res.data.syllabi.length > 0) {
          res.data.syllabi.forEach(s => {
            dispatch({ type: 'ADD_SYLLABUS', payload: s });
          });
        }
        if (res.data.user) {
          dispatch({ type: 'SET_USER_DATA', payload: res.data.user });
        }
      }

      // Also fetch roadmaps from Express
      const rmRes = await API.get('/roadmaps');
      if (Array.isArray(rmRes.data) && rmRes.data.length > 0) {
        dispatch({ type: 'SET_ROADMAPS', payload: rmRes.data });
      }
    } catch (err) {
      // Graceful fallback to initial mock state if backend not ready
      console.warn('Backend sync note:', err.message);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, [state.isAuthenticated]);

  // Track topic progress live with the backend
  const trackTopicProgress = async (roadmapId, itemId, status) => {
    dispatch({ type: 'MARK_TOPIC', payload: { id: itemId, status } });
    try {
      const res = await API.patch(`/roadmaps/${roadmapId}/progress`, { itemId, status });
      if (res.data && res.data.progressPercentage !== undefined) {
        dispatch({
          type: 'UPDATE_SYLLABUS_PROGRESS',
          payload: { id: roadmapId, progress: res.data.progressPercentage },
        });
      }
      return res.data;
    } catch (err) {
      console.warn('Progress API sync note:', err.message);
    }
  };

  // Delete a syllabus and its progress
  const deleteSyllabus = async (id) => {
    dispatch({ type: 'DELETE_SYLLABUS', payload: id });
    try {
      await API.delete(`/roadmaps/${id}`);
    } catch (err) {
      console.warn('Delete syllabus API sync note:', err.message);
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, trackTopicProgress, fetchDashboardData, deleteSyllabus }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

