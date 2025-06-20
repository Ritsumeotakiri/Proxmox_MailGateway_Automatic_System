import { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import './styles/App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home/Home';
import Quarantine from './pages/Qurantine/Quarantine';
import Policy from './pages/policies/policies';
import BlockAllowList from './pages/BlockAllowList/BlockAllowList';
import SettingsPage from './pages/settingPage/setting';
import Signup from './pages/Authpage/Authpage';
import ProtectedRoute from './api/ProtectedRoute';
import { fetchCurrentUser } from './api/auth/auth';

// Animated route wrapper
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/signup" replace />} />

        <Route
          path="/Home"
          element={
            <ProtectedRoute>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: 'relative', width: '100%' }}
              >
                <Home />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Quarantine"
          element={
            <ProtectedRoute>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: 'relative', width: '100%' }}
              >
                <Quarantine />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/policies"
          element={
            <ProtectedRoute>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: 'relative', width: '100%' }}
              >
                <Policy />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/BlockAllowList"
          element={
            <ProtectedRoute>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: 'relative', width: '100%' }}
              >
                <BlockAllowList />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/setting"
          element={
            <ProtectedRoute>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: 'relative', width: '100%' }}
              >
                <SettingsPage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ width: '100%' }}
            >
              <Signup />
            </motion.div>
          }
        />

        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Added
  const location = useLocation();

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  const isAuthPage = location.pathname === '/signup';

  useEffect(() => {
  if (!isAuthPage) {
    fetchCurrentUser()
      .then(data => {
        console.log('✅ user fetched:', data);
        setUser(data?.user || data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ fetchCurrentUser failed:', err.message);
        setUser(null);
        setLoading(false);
      });
  } else {
    setLoading(false);
  }
}, [isAuthPage]);


  if (loading) return null; // ⛔ Prevent redirect loop by waiting for user check

  return (
    <div className={isAuthPage ? '' : 'grid-container'}>
      {!isAuthPage && user && <Header OpenSidebar={OpenSidebar} user={user} />}
      {!isAuthPage && (
        <Sidebar
          openSidebarToggle={openSidebarToggle}
          OpenSidebar={OpenSidebar}
        />
      )}
      <main className={isAuthPage ? '' : 'main-container'}>
        <AnimatedRoutes />
      </main>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
