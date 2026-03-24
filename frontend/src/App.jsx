import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BookSession from "./pages/BookSession";
import Dashboard from "./pages/Dashboard";
import ClientHistory from "./pages/ClientHistory";
import Admin from "./pages/Admin";
import CounsellorProfile from "./pages/CounsellorProfile";
import RateSession from "./pages/RateSession";
import Ratings from "./pages/Ratings";
import DashboardHome from "./pages/DashboardHome";
import Services from "./pages/Services";
import About from "./pages/About";

import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Main Pages */}
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<CounsellorProfile />} />

        {/* Booking & History */}
        <Route path="/book-session" element={<BookSession />} />
        <Route path="/my-appointments" element={<ClientHistory />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/rate-session" element={<RateSession />} />
        <Route path="/ratings" element={<Ratings />} />

        <Route
          path="/dashboard-home"
          element={
            <PrivateRoute>
              <DashboardHome />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
