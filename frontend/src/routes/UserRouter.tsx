import LandingPage from "../pages/user/Home/LandingPage";
import UserLayout from "../layouts/userLayout/UserLayout";
import Login from "../pages/user/Auth/Login";
import Register from "../pages/user/Auth/Register";
import { Routes, Route } from "react-router-dom";
import UserSessionRoute from "../protecter/userProtecter/UserSessionRoute";
import TaskList from "../pages/user/Task/TaskList";
import TaskDetail from "../pages/user/Task/TaskDetail";
import ProfilePage from "../pages/user/Profile/ProfilePage";
import SidebarWrapper from "../layouts/userLayout/SidebarWrapper";
import AnalyticsDashboard from "@/pages/user/Analytics/AnalyticsDashboard";
import OTPVerification from "@/pages/user/Auth/OTPVerification";

const UserRouter = () => {
  return (
    <Routes>
      {/* user layout */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/register"
          element={
            <UserSessionRoute>
              <Register />
            </UserSessionRoute>
          }
        />
        <Route
          path="/login"
          element={
            <UserSessionRoute>
              <Login />
            </UserSessionRoute>
          }
        />
        <Route path="/verify-otp" element={<OTPVerification/>}/>
      </Route>
      {/* sidebar layout */}
      <Route element={<SidebarWrapper />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="/dashboard" element={<AnalyticsDashboard />} />
        
      </Route>
    </Routes>
  );
};

export default UserRouter;
