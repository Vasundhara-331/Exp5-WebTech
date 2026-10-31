import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';

// Code splitting: only the landing page ships in the main bundle. Every other page is
// downloaded the first time it is visited, which keeps the first load small.
const Events = lazy(() => import('./pages/Events'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Suspense fallback={<p className="container page muted">Loading...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
