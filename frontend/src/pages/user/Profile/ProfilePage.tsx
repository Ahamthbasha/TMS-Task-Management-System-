import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/api/authAction/userAuth';
import { toast } from 'react-toastify';
import './ProfilePage.css';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getCurrentUser();
      
      if (response.success) {
        setUserData(response.data);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch user data:', error);
      
      let errorMessage = 'Failed to load profile data';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as ApiError;
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
        
        if (apiError.response?.status === 401) {
          navigate('/login');
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="profile-loading-container">
        <div className="profile-loading-content">
          <div className="profile-spinner"></div>
          <p className="profile-loading-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-error-container">
        <div className="profile-error-content">
          <h2 className="profile-error-title">Profile Not Found</h2>
          <p className="profile-error-message">Unable to load user profile data</p>
          <button
            onClick={() => navigate('/login')}
            className="profile-error-button"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">User Profile</h1>
          <p className="profile-subtitle">
            View and manage your account information
          </p>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {/* Left Column - Profile Card */}
          <div className="profile-main">
            <div className="profile-card">
              {/* Profile Header */}
              <div className="profile-card-header">
                <div className="profile-card-header-content">
                  {/* Avatar */}
                  <div className="profile-avatar">
                    {getInitials(userData.name)}
                  </div>
                  
                  {/* User Info */}
                  <div className="profile-user-info">
                    <h2 className="profile-user-name">{userData.name}</h2>
                    <p className="profile-user-email">{userData.email}</p>
                    <div className="profile-badges">
                      <span className={`profile-badge ${userData.isActive ? 'badge-active' : 'badge-inactive'}`}>
                        {userData.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="profile-badge badge-role">
                        {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="profile-details">
                <h3 className="profile-details-title">Account Information</h3>
                
                <div className="profile-details-grid">
                  {/* Personal Info */}
                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <label className="profile-info-label">
                        Full Name
                      </label>
                      <p className="profile-info-value">{userData.name}</p>
                    </div>
                    
                    <div className="profile-info-item">
                      <label className="profile-info-label">
                        Email Address
                      </label>
                      <p className="profile-info-value">{userData.email}</p>
                    </div>
                    
                    <div className="profile-info-item">
                      <label className="profile-info-label">
                        Account Role
                      </label>
                      <p className="profile-info-value">
                        {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                      </p>
                    </div>
                    
                    <div className="profile-info-item">
                      <label className="profile-info-label">
                        Account Status
                      </label>
                      <p className={`profile-info-value ${userData.isActive ? 'status-active' : 'status-inactive'}`}>
                        {userData.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;