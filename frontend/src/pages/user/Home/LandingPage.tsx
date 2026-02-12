// src/pages/LandingPage.tsx

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../types/interface/userInterface";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const isLoggedIn = !!user.userId;
 

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-wrapper">
          <div className="hero-content">
            <h1 className="hero-title">
              Organize Your Tasks,{" "}
              <span className="hero-highlight">Achieve More</span>
            </h1>
            <p className="hero-description">
              The ultimate task management solution that helps you stay organized,
              focused, and productive. Transform the way you work today.
            </p>
            <div className="hero-buttons">
              <button onClick={handleGetStarted} className="btn btn-primary">
                Get Started Free <span className="btn-icon">🚀</span>
              </button>
              <button onClick={() => navigate("/login")} className="btn btn-secondary">
                Sign In
              </button>
            </div>
            
          </div>

          {/* Demo Tasks Card */}
          <div className="demo-card">
            <div className="demo-card-header">
              <h3>Today's Tasks</h3>
              <div className="demo-progress">
                <span className="demo-progress-text">0/5 completed</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
            <div className="demo-tasks">
              {[1, 2, 3, 4, 5].map((id) => (
                <div key={id} className="demo-task-item">
                  <div className="demo-task-checkbox"></div>
                  <span className="demo-task-title">Sample task {id}</span>
                  <span className="demo-task-priority">medium</span>
                </div>
              ))}
            </div>
            <button className="demo-add-btn">Add New Task</button>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="interactive-demo">
        <div className="demo-wrapper">
          <h2 className="demo-main-title">Try It Yourself</h2>
          <p className="demo-subtitle">
            Experience the power of TSK with our interactive demo
          </p>
          
          <div className="demo-panel">
            <div className="demo-form">
              <h3 className="form-title">Create Your First Task</h3>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <div className="priority-group">
                  {['Low', 'Medium', 'High'].map((priority) => (
                    <button
                      key={priority}
                      className={`priority-btn ${priority === 'Medium' ? 'active' : ''}`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
              <button className="demo-submit-btn">
                Add Task to Demo Board
              </button>
            </div>
            
            <div className="demo-board">
              <h4 className="board-title">Demo Board</h4>
              <div className="board-tasks">
                {[1, 2, 3].map((id) => (
                  <div key={id} className="board-task">
                    <div className="task-checkbox"></div>
                    <span className="task-text">Sample task {id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        
        
        <div className="cta-wrapper">
          <h2 className="cta-title">Ready to Transform Your Productivity?</h2>
          <p className="cta-description">
            Join thousands of teams who are already achieving more with TSK. 
            Start your journey today and experience the difference.
          </p>
          
          <div className="cta-buttons">
            <button onClick={handleGetStarted} className="btn btn-cta-primary">
              Start Free Today <span className="btn-icon">✨</span>
            </button>
            <button onClick={() => navigate("/login")} className="btn btn-cta-secondary">
              Schedule a Demo
            </button>
          </div>
          
          <div className="cta-features">
            <span className="cta-feature">✓ No setup required</span>
            <span className="cta-feature">✓ Free 14-day trial</span>
            <span className="cta-feature">✓ Cancel anytime</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;