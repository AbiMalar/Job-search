import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetails from './pages/JobDetails.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import SeekerDashboard from './pages/SeekerDashboard.jsx';
import EmployerDashboard from './pages/EmployerDashboard.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/seeker" element={<ProtectedRoute role="JOB_SEEKER"><SeekerDashboard /></ProtectedRoute>} />
          <Route path="/employer" element={<ProtectedRoute role="EMPLOYER"><EmployerDashboard /></ProtectedRoute>} />
          <Route path="*" element={<div className="wrap"><div className="empty">Page not found. <a href="/">Go to the home page</a></div></div>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
