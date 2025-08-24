import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Profile from "./components/Auth/Profile";
import Navigation from "./components/Navigation/Navigation";
import StudentDashboard from "./Dashboard/StudentDashboard";
import AchievementsForm from "./Achievements/AchievementsForm";
import AchievementsList from "./Achievements/AchievementsList";
import AchievementsValidation from "./Achievements/AchievementsValidation";
import Notifications from "./Notifications/Notifications";
import Leaderboard from "./Leaderboard/Leaderboard";
import Portfolio from "./Portfolio/Portfolio";
import AdminDashboard from "./Admin/AdminDashboard";
import AdvancedSearch from "./Search/AdvancedSearch";
import AnalyticsDashboard from "./Analytics/AnalyticsDashboard";
import AchievementDetail from "./Achievements/AchievementDetail";
import EditAchievement from "./Achievements/EditAchievement";
import DataImport from "./Import/DataImport";
import { AuthProvider, AuthContext } from "./context/AuthContext";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function PrivateRoute({ children }) {
  const { user } = React.useContext(AuthContext);
  return user ? (
    <>
      <Navigation />
      {children}
    </>
  ) : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/achievements/new" element={<PrivateRoute><AchievementsForm /></PrivateRoute>} />
            <Route path="/achievements" element={<PrivateRoute><AchievementsList /></PrivateRoute>} />
            <Route path="/achievements/:id" element={<PrivateRoute><AchievementDetail /></PrivateRoute>} />
            <Route path="/achievements/edit/:id" element={<PrivateRoute><EditAchievement /></PrivateRoute>} />
            <Route path="/achievements/validate" element={<PrivateRoute><AchievementsValidation /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
            <Route path="/portfolio" element={<PrivateRoute><Portfolio /></PrivateRoute>} />
            <Route path="/search" element={<PrivateRoute><AdvancedSearch /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><AnalyticsDashboard /></PrivateRoute>} />
            <Route path="/import" element={<PrivateRoute><DataImport /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;