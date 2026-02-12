import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUserDetails } from "../../redux/slices/userSlice"; 
import { logout as logoutAPI } from "../../api/authAction/userAuth"; 
import type { RootState } from "../../types/interface/userInterface";
import { toast } from "react-toastify";
import './css/Header.css'

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  
  const isLoggedIn = !!user.userId;

  const handleLogout = async () => {
    try {
      await logoutAPI();
      dispatch(clearUserDetails());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo-container">
          <button
            onClick={handleLogoClick}
            className="logo-button"
          >
            TSK
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="nav-buttons">
          {isLoggedIn ? (
            <>
              {/* Profile Button */}
              <button
                onClick={handleProfile}
                className="profile-button"
              >
                <div className="avatar">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="username">{user.name}</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login Button */}
              <button
                onClick={handleLogin}
                className="login-button"
              >
                Login
              </button>

              {/* Sign Up Button */}
              <button
                onClick={handleSignUp}
                className="signup-button"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;