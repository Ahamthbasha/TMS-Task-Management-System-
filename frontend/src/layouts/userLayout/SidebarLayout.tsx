
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../api/authAction/userAuth';
import { toast } from 'react-toastify';
import ConfirmationDialog from '../../components/ConfirmationDialog'; 
import './css/SidebarLayout.css';
import { clearUserDetails } from '../../redux/slices/userSlice';
import { useDispatch } from 'react-redux';

interface User {
  name?: string;
  email?: string;
  [key: string]: unknown;
}

interface SidebarItem {
  id: string;
  name: string;
  path: string;
  icon: React.ReactNode;
  subItems?: SidebarSubItem[];
}

interface SidebarSubItem {
  id: string;
  name: string;
  path: string;
}

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['analytics']));
  const [currentUser, setCurrentUser] = useState<User>({});
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const dispatch = useDispatch()

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      setCurrentUser({});
    }
  }, []);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'tasks',
      name: 'Tasks',
      path: '/tasks',
      icon: (
        <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'profile',
      name: 'Profile',
      path: '/profile',
      icon: (
        <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      dispatch(clearUserDetails())
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleMenu = (menuId: string): void => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const isActiveRoute = (path: string): boolean => {
    return location.pathname === path;
  };

  const isActiveParentRoute = (item: SidebarItem): boolean => {
    if (location.pathname === item.path) return true;
    if (item.subItems && item.subItems.length > 0) {
      return item.subItems.some(subItem => location.pathname === subItem.path);
    }
    return false;
  };

  const getPageTitle = (): string => {
    for (const item of sidebarItems) {
      if (item.path === location.pathname) return item.name;
      if (item.subItems && item.subItems.length > 0) {
        const subItem = item.subItems.find(sub => sub.path === location.pathname);
        if (subItem) return `${item.name} - ${subItem.name}`;
      }
    }
    return 'Dashboard';
  };

  return (
    <div className="sidebar-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-header-content">
            {!isSidebarCollapsed && (
              <h1 className="sidebar-title">Task Manager</h1>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="sidebar-toggle"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg className="sidebar-toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isSidebarCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="sidebar-profile">
          <div className="sidebar-profile-content">
            <div className="sidebar-avatar">
              {getInitials(currentUser?.name || 'User')}
            </div>
            {!isSidebarCollapsed && (
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">{currentUser?.name || 'User'}</p>
                <p className="sidebar-user-email">{currentUser?.email || 'user@example.com'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {sidebarItems.map((item) => {
              const isActive = isActiveRoute(item.path);
              const isParentActive = isActiveParentRoute(item);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedMenus.has(item.id) && !isSidebarCollapsed;

              return (
                <li key={item.id} className="sidebar-nav-item">
                  {hasSubItems ? (
                    <>
                      <button
                        onClick={() => toggleMenu(item.id)}
                        className={`sidebar-nav-button ${isParentActive ? 'active' : ''}`}
                        title={isSidebarCollapsed ? item.name : ''}
                        aria-label={item.name}
                      >
                        <div className="sidebar-nav-button-content">
                          <span className="sidebar-icon-wrapper">{item.icon}</span>
                          {!isSidebarCollapsed && (
                            <span className="sidebar-nav-text">{item.name}</span>
                          )}
                        </div>
                        {!isSidebarCollapsed && (
                          <svg
                            className={`sidebar-chevron ${isExpanded ? 'rotated' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>
                      
                      {/* Submenu */}
                      {isExpanded && !isSidebarCollapsed && item.subItems && (
                        <ul className="sidebar-submenu">
                          {item.subItems.map((subItem) => {
                            const isSubActive = isActiveRoute(subItem.path);
                            return (
                              <li key={subItem.id} className="sidebar-submenu-item">
                                <Link
                                  to={subItem.path}
                                  className={`sidebar-submenu-link ${isSubActive ? 'active' : ''}`}
                                >
                                  <span className="sidebar-submenu-dot"></span>
                                  <span className="sidebar-submenu-text">{subItem.name}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                      title={isSidebarCollapsed ? item.name : ''}
                      aria-label={item.name}
                    >
                      <span className="sidebar-icon-wrapper">{item.icon}</span>
                      {!isSidebarCollapsed && (
                        <span className="sidebar-nav-text">{item.name}</span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button
            onClick={() => setIsLogoutDialogOpen(true)}
            disabled={isLoggingOut}
            className={`sidebar-logout-button ${isLoggingOut ? 'disabled' : ''}`}
            title={isSidebarCollapsed ? 'Logout' : ''}
            aria-label="Logout"
          >
            <svg className="sidebar-logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isSidebarCollapsed && (
              <span className="sidebar-logout-text">
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="main-header">
          <div className="main-header-container">
            <div className="main-header-left">
              <div>
                <h2 className="page-title">
                  {getPageTitle()}
                </h2>
                <p className="welcome-text">
                  Welcome back, <span className="welcome-name">{currentUser?.name || 'User'}</span>!
                </p>
              </div>
            </div>
            <div className="main-header-right">
              {/* Notification Bell */}
              <button 
                className="notification-button"
                title="Notifications"
                aria-label="Notifications"
              >
                <svg className="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="notification-badge" aria-hidden="true"></span>
              </button>
              
              {/* User Menu */}
              <div className="user-menu">
                <div className="user-info">
                  <p className="user-name">{currentUser?.name || 'User'}</p>
                  <p className="user-email">{currentUser?.email || 'user@example.com'}</p>
                </div>
                <div className="user-avatar">
                  {getInitials(currentUser?.name || 'U')}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </main>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
};

export default SidebarLayout;