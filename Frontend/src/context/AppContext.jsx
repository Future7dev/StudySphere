import React, { createContext, useContext, useReducer } from 'react';
import API from '../api/axios';

const AppContext = createContext(null);

const defaultUser = {
  name: '',
  email: '',
  avatar: null,
  streak: 0,
  totalTopicsCompleted: 0,
  totalQuizzesTaken: 0,
  averageQuizScore: 0,
  badges: [],
};

const defaultSyllabi = [];

const getDeletedSyllabi = () => {
  try {
    const raw = localStorage.getItem('deletedSyllabi');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveDeletedSyllabi = (ids) => {
  try {
    localStorage.setItem('deletedSyllabi', JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to save deletedSyllabi:', err);
  }
};

const getSavedSyllabi = () => {
  try {
    const raw = localStorage.getItem('uploadedSyllabi');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return null;
};

const saveUploadedSyllabi = (syllabi) => {
  try {
    localStorage.setItem('uploadedSyllabi', JSON.stringify(syllabi));
  } catch (err) {
    console.error('Failed to save uploadedSyllabi:', err);
  }
};

const savedUser = (() => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();
const hasToken = !!localStorage.getItem('token');

const initialDeleted = getDeletedSyllabi();
const savedSyllabi = getSavedSyllabi();
const baseSyllabi = savedSyllabi !== null ? savedSyllabi : defaultSyllabi;
const initialUploadedSyllabi = baseSyllabi.filter(
  s => !initialDeleted.includes(s.id) && !initialDeleted.includes(s.slug) && !initialDeleted.includes(s._id)
);
const initialRoadmaps = [];

const initialState = {
  user: savedUser ? { ...defaultUser, ...savedUser } : defaultUser,
  isAuthenticated: hasToken,
  roadmaps: initialRoadmaps,
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
  uploadedSyllabi: initialUploadedSyllabi,
  quizResults: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true, user: { ...state.user, ...action.payload } };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('uploadedSyllabi');
      localStorage.removeItem('deletedSyllabi');
      return {
        ...state,
        isAuthenticated: false,
        user: defaultUser,
        uploadedSyllabi: [],
        roadmaps: [],
      };
    case 'SIGNUP':
      return { ...state, isAuthenticated: true, user: { ...state.user, ...action.payload } };
    case 'SET_ROADMAPS': {
      const currentDeleted = getDeletedSyllabi();
      const filtered = (action.payload || []).filter(
        r => !currentDeleted.includes(r.id) && !currentDeleted.includes(r.slug) && !currentDeleted.includes(r._id)
      );
      return { ...state, roadmaps: filtered };
    }
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
    case 'SET_SYLLABI': {
      const currentDeleted = getDeletedSyllabi();
      const filtered = (action.payload || []).filter(
        s => !currentDeleted.includes(s.id) && !currentDeleted.includes(s.slug) && !currentDeleted.includes(s._id)
      );
      saveUploadedSyllabi(filtered);
      return {
        ...state,
        uploadedSyllabi: filtered,
      };
    }
    case 'ADD_SYLLABUS': {
      const sId = action.payload.id || action.payload.slug;
      const currentDeleted = getDeletedSyllabi();
      if (currentDeleted.includes(sId) || currentDeleted.includes(action.payload.id) || currentDeleted.includes(action.payload.slug)) {
        const filteredDeleted = currentDeleted.filter(
          id => id !== sId && id !== action.payload.id && id !== action.payload.slug
        );
        saveDeletedSyllabi(filteredDeleted);
      }
      const updatedSyllabi = [
        action.payload,
        ...state.uploadedSyllabi.filter(s => s.id !== action.payload.id && s.id !== sId),
      ];
      saveUploadedSyllabi(updatedSyllabi);
      return {
        ...state,
        uploadedSyllabi: updatedSyllabi,
      };
    }
    case 'DELETE_SYLLABUS': {
      const target = action.payload;
      const currentDeleted = getDeletedSyllabi();
      if (!currentDeleted.includes(target)) {
        currentDeleted.push(target);
        saveDeletedSyllabi(currentDeleted);
      }
      const updatedSyllabi = state.uploadedSyllabi.filter(
        s => s.id !== target && s.slug !== target && s._id !== target
      );
      saveUploadedSyllabi(updatedSyllabi);
      const updatedRoadmaps = (state.roadmaps || []).filter(
        r => r.id !== target && r.slug !== target && r._id !== target
      );
      return {
        ...state,
        uploadedSyllabi: updatedSyllabi,
        roadmaps: updatedRoadmaps,
      };
    }
    case 'UPDATE_SYLLABUS_PROGRESS': {
      const updatedSyllabi = state.uploadedSyllabi.map(s =>
        s.id === action.payload.id || s.slug === action.payload.id
          ? { ...s, progress: action.payload.progress }
          : s
      );
      saveUploadedSyllabi(updatedSyllabi);
      return {
        ...state,
        uploadedSyllabi: updatedSyllabi,
      };
    }
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
      const currentDeleted = getDeletedSyllabi();

      if (token) {
        const res = await API.get('/roadmaps/user/dashboard-summary');
        if (res.data) {
          if (Array.isArray(res.data.syllabi)) {
            const backendSyllabi = res.data.syllabi.filter(
              s => !currentDeleted.includes(s.id) && !currentDeleted.includes(s.slug) && !currentDeleted.includes(s._id)
            );

            // Reconcile with non-deleted local/mock syllabi
            const backendIds = new Set(backendSyllabi.map(s => s.id));
            const existingNonDeleted = (getSavedSyllabi() || state.uploadedSyllabi).filter(
              s => !currentDeleted.includes(s.id) && !currentDeleted.includes(s.slug) && !backendIds.has(s.id)
            );

            const merged = [...backendSyllabi, ...existingNonDeleted];
            dispatch({ type: 'SET_SYLLABI', payload: merged });
          }
          if (res.data.user) {
            dispatch({ type: 'SET_USER_DATA', payload: res.data.user });
          }
        }
      }

      // Also fetch roadmaps from Express
      const rmRes = await API.get('/roadmaps');
      if (Array.isArray(rmRes.data) && rmRes.data.length > 0) {
        const filteredRoadmaps = rmRes.data.filter(
          r => !currentDeleted.includes(r.id) && !currentDeleted.includes(r.slug) && !currentDeleted.includes(r._id)
        );
        dispatch({ type: 'SET_ROADMAPS', payload: filteredRoadmaps });
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
    if (!id) return;
    dispatch({ type: 'DELETE_SYLLABUS', payload: id });
    try {
      await API.delete(`/roadmaps/${encodeURIComponent(id)}`);
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
