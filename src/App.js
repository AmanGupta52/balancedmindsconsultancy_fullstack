import './App.css';
import "react-toastify/dist/ReactToastify.css";
import Homepage from './components/Homepage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import About from './components/About';
import Expert from './components/Experts';
import Contact from './components/contact';
import Service from './components/Service';
import Notifications from './components/Notifications';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Motivation from './components/motivation';
import Counselling from './components/Counselling';
import Career from './components/Career';
import Lifecoaching from './components/life-coaching';
import Softskills from './components/soft-skills';
import Imageconsultant from './components/image-consultant';
import Graphologist from './components/graphologist';
import Reiki from './components/reiki';
import Studyabroad from './components/study-abroad';
import AdminDashboard from "./Admin/AdminDashboard";
import ModeratorDashboard from "./components/ModeratorDashboard";
import Profile from './components/Profile';
import News from "./components/News";
import VideoCall from './components/VideoCall';


import { AuthProvider } from './context/AuthContext';  // ✅ import

function App() {
  return (


    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/about" element={<About />} />
          <Route path="/experts" element={<Expert />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/Service" element={<Service />} />
          <Route path='/Notifications' element={<Notifications />} />
          <Route path="/Counselling" element={<Counselling />} />
          <Route path="/Career" element={<Career />} />
          <Route path="/life-coaching" element={<Lifecoaching />} />
          <Route path="/soft-skills" element={<Softskills />} />
          <Route path="/image-consultant" element={<Imageconsultant />} />
          <Route path="/study-abroad" element={<Studyabroad />} />
          <Route path="/graphologist" element={<Graphologist />} />
          <Route path="/reiki" element={<Reiki />} />
          <Route path="/motivation" element={<Motivation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/news" element={<News />} />
          <Route path="/videocall" element={<VideoCall />} />



          {/* Dashboards */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/moderator-dashboard" element={<ModeratorDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
