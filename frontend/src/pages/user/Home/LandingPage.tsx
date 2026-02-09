import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../types/interface/userInterface";
import { useState, useEffect } from "react";

const LandingPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const isLoggedIn = !!user.userId;
  const [activeFeature, setActiveFeature] = useState(0);
  const [counters, setCounters] = useState({
    users: 0,
    tasks: 0,
    satisfaction: 0,
    support: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Animate counters
    const targetCounters = {
      users: 10000,
      tasks: 50000,
      satisfaction: 99,
      support: 100,
    };

    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      
      setCounters({
        users: Math.min(Math.floor((targetCounters.users / steps) * currentStep), targetCounters.users),
        tasks: Math.min(Math.floor((targetCounters.tasks / steps) * currentStep), targetCounters.tasks),
        satisfaction: Math.min(Math.floor((targetCounters.satisfaction / steps) * currentStep), targetCounters.satisfaction),
        support: Math.min(Math.floor((targetCounters.support / steps) * currentStep), targetCounters.support),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, increment);

    return () => clearInterval(timer);
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  const features = [
    {
      icon: "📋",
      title: "Task Organization",
      description: "Create, organize, and prioritize your tasks effortlessly with our intuitive interface.",
      details: "Drag-and-drop interface, custom categories, smart tagging system",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: "⏰",
      title: "Smart Reminders",
      description: "Never miss a deadline with intelligent notifications and reminders.",
      details: "Customizable alerts, recurring reminders, priority notifications",
      color: "from-green-500 to-green-600",
    },
    {
      icon: "👥",
      title: "Team Collaboration",
      description: "Work together seamlessly with your team members in real-time.",
      details: "Shared workspaces, real-time updates, team chat integration",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      description: "Monitor your productivity with detailed analytics and insights.",
      details: "Visual dashboards, productivity reports, milestone tracking",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: "🎯",
      title: "Goal Setting",
      description: "Set and achieve your goals with milestone tracking and achievements.",
      details: "SMART goal templates, progress visualization, achievement badges",
      color: "from-red-500 to-red-600",
    },
    {
      icon: "🔒",
      title: "Secure & Private",
      description: "Your data is encrypted and protected with enterprise-grade security.",
      details: "End-to-end encryption, GDPR compliant, regular security audits",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const tasks = [
    { id: 1, title: "Complete project proposal", completed: true, priority: "high" },
    { id: 2, title: "Review team feedback", completed: false, priority: "medium" },
    { id: 3, title: "Prepare presentation", completed: false, priority: "high" },
    { id: 4, title: "Schedule team meeting", completed: false, priority: "low" },
    { id: 5, title: "Update documentation", completed: true, priority: "medium" },
  ];

  const toggleTask = (id: number) => {
    // This is just for demo - in real app you'd update state
    console.log(`Toggled task ${id}`);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Organize Your Tasks,{" "}
                <span className="text-blue-600 animate-pulse">Achieve More</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
                The ultimate task management solution that helps you stay organized,
                focused, and productive. Transform the way you work today.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  Get Started Free
                  <span className="ml-2 animate-bounce">🚀</span>
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 border-2 border-gray-200 hover:border-blue-300"
                >
                  Sign In
                </button>
              </div>
              <div className="mt-6 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Free forever plan</span>
                </div>
              </div>
            </div>

            {/* Right Content - Interactive Demo */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Today's Tasks</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm">{tasks.filter(t => t.completed).length}/{tasks.length} completed</span>
                      <div className="w-8 h-2 bg-white/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-500"
                          style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-50 ${
                        task.completed ? 'opacity-75' : ''
                      }`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                        task.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300 hover:border-blue-500'
                      }`}>
                        {task.completed && (
                          <span className="text-white text-sm">✓</span>
                        )}
                      </div>
                      <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                        {task.title}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-all duration-300">
                    Add New Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything You Need to Stay Productive
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful features designed to help you accomplish more
            </p>
          </div>

          {/* Feature Selector */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeFeature === index
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {feature.title}
              </button>
            ))}
          </div>

          {/* Active Feature Display */}
          <div className={`bg-white rounded-2xl shadow-xl p-8 mb-12 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-6xl mb-6">{features[activeFeature].icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {features[activeFeature].title}
                </h3>
                <p className="text-gray-600 text-lg mb-6">
                  {features[activeFeature].description}
                </p>
                <ul className="space-y-3">
                  {features[activeFeature].details.split(', ').map((detail, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8">
                <div className="text-center">
                  <div className={`text-8xl mb-6 animate-bounce ${activeFeature % 2 === 0 ? 'animate-bounce' : 'animate-pulse'}`}>
                    {features[activeFeature].icon}
                  </div>
                  <div className="text-sm text-gray-600 uppercase tracking-wider">Live Preview</div>
                </div>
              </div>
            </div>
          </div>

          {/* All Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 ${
                  activeFeature === index ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className={`text-4xl mb-4 transition-transform duration-300 hover:scale-110`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2">
                    Learn more
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-blue-100 text-lg">
              Join our growing community of productive teams
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: counters.users, label: "Active Users", suffix: "+", icon: "👥" },
              { value: counters.tasks, label: "Tasks Completed", suffix: "+", icon: "✅" },
              { value: counters.satisfaction, label: "Satisfaction Rate", suffix: "%", icon: "⭐" },
              { value: counters.support, label: "Support Quality", suffix: "%", icon: "🛡️" },
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-3xl mb-4">{stat.icon}</div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-blue-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Progress Visualization */}
          <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              Weekly Productivity Trend
            </h3>
            <div className="flex items-end justify-center h-40 gap-2">
              {[65, 78, 85, 92, 88, 95, 89].map((height, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-10 bg-gradient-to-t from-blue-400 to-purple-400 rounded-t-lg transition-all duration-500 hover:opacity-80"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-blue-100 text-sm mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Try It Yourself
            </h2>
            <p className="text-lg text-gray-600">
              Experience the power of TSK with our interactive demo
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-xl">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Create Your First Task
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Title
                    </label>
                    <input
                      type="text"
                      placeholder="What needs to be done?"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <div className="flex gap-2">
                      {['Low', 'Medium', 'High'].map((priority) => (
                        <button
                          key={priority}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            priority === 'Medium'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-all duration-300">
                    Add Task to Demo Board
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Demo Board</h4>
                <div className="space-y-3">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-5 h-5 rounded border-2 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}></div>
                      <span className={task.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-white/10 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of teams who are already achieving more with TSK. 
            Start your journey today and experience the difference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-10 py-5 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              Start Free Today
              <span className="ml-3 animate-bounce">✨</span>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-10 py-5 bg-transparent text-white text-lg font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 border-2 border-white"
            >
              Schedule a Demo
            </button>
          </div>
          
          <div className="mt-8 text-blue-100">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-300">✓</span>
                <span>No setup required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-300">✓</span>
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-300">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;