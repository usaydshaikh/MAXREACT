import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet';
import { I18nextProvider, initReactI18next, useTranslation } from 'react-i18next';
import i18n from 'i18next';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import './App.css';

// Initialize Sentry (replace YOUR_SENTRY_DSN with your actual DSN)
Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});

// Initialize i18next for internationalization
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        home: "Home",
        about: "About",
        services: "Services",
        careers: "Careers",
        contact: "Contact",
        dashboard: "Dashboard",
        "Empowering Your Energy Future": "Empowering Your Energy Future",
        "Join us in building sustainable solutions for tomorrow.": "Join us in building sustainable solutions for tomorrow.",
        "Connect with us on Social Media": "Connect with us on Social Media",
        "Sign In": "Sign In",
        "Log Out": "Log Out",
        "Send Message": "Send Message",
        "Search energy rates...": "Search energy rates..."
      }
    },
    es: {
      translation: {
        home: "Inicio",
        about: "Acerca de",
        services: "Servicios",
        careers: "Carreras",
        contact: "Contacto",
        dashboard: "Tablero",
        "Empowering Your Energy Future": "Potenciando Tu Futuro Energético",
        "Join us in building sustainable solutions for tomorrow.": "Únete a nosotros para construir soluciones sostenibles para el mañana.",
        "Connect with us on Social Media": "Conéctate con nosotros en redes sociales",
        "Sign In": "Iniciar Sesión",
        "Log Out": "Cerrar Sesión",
        "Send Message": "Enviar Mensaje",
        "Search energy rates...": "Buscar tarifas energéticas..."
      }
    }
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

// A helper function to return dynamic meta keywords based on current section
function getMetaKeywords(tab) {
  switch (tab) {
    case 'home':
      return 'energy, sustainable, future, solutions';
    case 'about':
      return 'about, energy, sustainability, company';
    case 'services':
      return 'services, energy solutions, efficiency, reliability';
    case 'careers':
      return 'careers, jobs, energy, opportunities';
    case 'contact':
      return 'contact, inquiries, support, energy';
    case 'dashboard':
      return 'dashboard, analytics, energy rates, data';
    default:
      return 'energy, solutions';
  }
}

/* ==================== Spinner Component ==================== */
function Spinner() {
  return <div className="spinner"></div>;
}

/* ==================== Error Boundary Component ==================== */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div className="error-boundary">Something went wrong.</div>;
    }
    return this.props.children;
  }
}

/* ==================== Custom Hook: Debounce ==================== */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

/* ==================== Generic Modal Component ==================== */
function Modal({ children, onClose, ariaLabel }) {
  const modalRef = useRef(null);
  useEffect(() => {
    if (modalRef.current) modalRef.current.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <div className="modal-content" ref={modalRef} tabIndex="-1">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

/* ==================== Navigation Component ==================== */
function Navigation({ currentTab, setCurrentTab, searchQuery, setSearchQuery, handleSearch, openLoginModal, isLoggedIn, user, handleLogout }) {
  const { t, i18n } = useTranslation();
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "es" : "en";
    i18n.changeLanguage(newLang);
  };
  const debouncedSearch = useDebounce(searchQuery, 300);
  const handleTabClick = (tab) => {
    if (window.gtag) {
      window.gtag("event", "tab_change", { event_category: "navigation", event_label: tab });
    }
    setCurrentTab(tab);
  };
  return (
    <header>
      <nav className="navbar">
        <div className="navbar-left">
          <img
            src="/Branding/MAXX-Energy-Logo-1B.png"
            alt="Maxx Energy Logo"
            className="logo"
            onClick={() => handleTabClick('home')}
          />
        </div>
        <div className="navbar-center">
          <button className={currentTab === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => handleTabClick('home')}>
            {t('home')}
          </button>
          <button className={currentTab === 'about' ? 'nav-link active' : 'nav-link'} onClick={() => handleTabClick('about')}>
            {t('about')}
          </button>
          <button className={currentTab === 'services' ? 'nav-link active' : 'nav-link'} onClick={() => handleTabClick('services')}>
            {t('services')}
          </button>
          <button className={currentTab === 'careers' ? 'nav-link active' : 'nav-link'} onClick={() => handleTabClick('careers')}>
            {t('careers')}
          </button>
          <button className={currentTab === 'contact' ? 'nav-link active' : 'nav-link'} onClick={() => handleTabClick('contact')}>
            {t('contact')}
          </button>
          <button className={currentTab === 'dashboard' ? 'nav-link active' : 'nav-link'} onClick={() => handleTabClick('dashboard')}>
            {t('dashboard')}
          </button>
        </div>
        <div className="navbar-search">
          <input
            type="text"
            placeholder={t('Search energy rates...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t('Search energy rates...')}
          />
          <button className="search-btn" onClick={handleSearch}>
            🔍
          </button>
        </div>
        <div className="navbar-right">
          <button onClick={toggleLanguage} style={{ marginRight: '10px', background: 'none', border: 'none', color: 'var(--nav-text)', cursor: 'pointer' }}>
            {i18n.language.toUpperCase()}
          </button>
          {!isLoggedIn ? (
            <button className="login-btn" onClick={openLoginModal}>
              {t('Sign In')}
            </button>
          ) : (
            <div className="user-info">
              <span>Welcome, {user.name}!</span>
              <button className="logout-btn" onClick={handleLogout}>
                {t('Log Out')}
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

/* ==================== Authentication Forms ==================== */
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (window.gtag) {
      window.gtag("event", "login_attempt", { event_category: "authentication", event_label: email });
    }
    const result = onLogin(email, password);
    if (!result.success) {
      setError(result.message);
    } else {
      setError("");
    }
  };
  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <div className="error-message">{error}</div>}
      <button type="submit">Log In</button>
    </form>
  );
}

function RegisterForm({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (window.gtag) {
      window.gtag("event", "register", { event_category: "authentication", event_label: email });
    }
    const result = onRegister(email, password);
    if (!result.success) {
      setError(result.message);
    } else {
      setError("");
    }
  };
  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <input type="password" placeholder="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      {error && <div className="error-message">{error}</div>}
      <button type="submit">Register</button>
    </form>
  );
}

function ForgotForm({ onForgot }) {
  const [email, setEmail] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (window.gtag) {
      window.gtag("event", "forgot_password", { event_category: "authentication", event_label: email });
    }
    onForgot(email);
  };
  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <button type="submit">Reset Password</button>
    </form>
  );
}

function NewsletterForm({ onNewsletter }) {
  const [email, setEmail] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (window.gtag) {
      window.gtag("event", "subscribe_newsletter", { event_category: "authentication", event_label: email });
    }
    onNewsletter(email);
  };
  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <button type="submit">Subscribe</button>
    </form>
  );
}

/* ==================== Auth Modal with Tabs ==================== */
function AuthModal({ onClose, onLogin, onRegister, onForgot, onNewsletter }) {
  const [activeTab, setActiveTab] = useState("login");
  return (
    <section>
      <Modal onClose={onClose} ariaLabel="Authentication Modal">
        <div className="auth-tabs">
          <button className={activeTab === "login" ? "auth-tab active" : "auth-tab"} onClick={() => setActiveTab("login")}>
            Login
          </button>
          <button className={activeTab === "register" ? "auth-tab active" : "auth-tab"} onClick={() => setActiveTab("register")}>
            Register
          </button>
          <button className={activeTab === "forgot" ? "auth-tab active" : "auth-tab"} onClick={() => setActiveTab("forgot")}>
            Forgot
          </button>
          <button className={activeTab === "newsletter" ? "auth-tab active" : "auth-tab"} onClick={() => setActiveTab("newsletter")}>
            Newsletter
          </button>
        </div>
        <div className="auth-content">
          {activeTab === "login" && <LoginForm onLogin={onLogin} />}
          {activeTab === "register" && <RegisterForm onRegister={onRegister} />}
          {activeTab === "forgot" && <ForgotForm onForgot={onForgot} />}
          {activeTab === "newsletter" && <NewsletterForm onNewsletter={onNewsletter} />}
        </div>
      </Modal>
    </section>
  );
}

/* ==================== Content Sections ==================== */
function HomeSection({ images, currentSlide }) {
  return (
    <section className="home-section">
      <div className="hero-section">
        <img src={images[currentSlide]} alt={`Slide ${currentSlide + 1}`} className="hero-image fade" loading="lazy" />
        <div className="hero-overlay">
          <h1>Empowering Your Energy Future</h1>
          <p>Join us in building sustainable solutions for tomorrow.</p>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="section about">
      <h2>About Us</h2>
      <p>We provide innovative energy solutions with cutting‑edge technology and a passion for sustainability.</p>
    </section>
  );
}

function ServicesSection() {
  return (
    <section className="section services">
      <h2>Our Services</h2>
      <p>Discover our diverse energy solutions designed for efficiency, reliability, and eco‑friendliness.</p>
    </section>
  );
}

function CareersSection() {
  return (
    <section className="section careers">
      <h2>Careers</h2>
      <p>Join our dynamic team and help shape the future of energy. Explore exciting opportunities and grow with us!</p>
    </section>
  );
}

function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert(`Thank you, we have successfully received your message.
Your message has been sent to usaydddd@icloud.com`);
      setName("");
      setEmail("");
      setMessage("");
      setIsSubmitting(false);
    }, 1000);
  };
  return (
    <section className="section contact">
      <h2>Contact Us</h2>
      <p>Reach out for more information, inquiries, or just to say hello. We love connecting with our community!</p>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <textarea placeholder="Your Message" value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (<><span className="spinner"></span> Sending...</>) : "Send Message"}
        </button>
      </form>
    </section>
  );
}

// Lazy load DashboardSection (for code splitting)
const DashboardSectionLazy = lazy(() => Promise.resolve({ default: DashboardSection }));

function DashboardSection({ searchQuery }) {
  const initialData = [
    { label: "January", value: 40 },
    { label: "February", value: 55 },
    { label: "March", value: 30 },
    { label: "April", value: 80 },
    { label: "May", value: 20 },
    { label: "June", value: 65 },
    { label: "July", value: 50 }
  ];
  const [data, setData] = useState(initialData);
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setData(initialData);
    } else {
      const filtered = initialData.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
      setData(filtered);
    }
  }, [searchQuery]);
  
  const chartWidth = 600;
  const chartHeight = 300;
  const maxVal = Math.max(...data.map(d => d.value), 100);
  const barWidth = chartWidth / data.length - 10;
  
  return (
    <section className="section dashboard">
      <h2>Dashboard</h2>
      <p>Searchable and scalable chart data.</p>
      <div className="chart-container">
        <svg width={chartWidth} height={chartHeight}>
          {data.map((d, i) => {
            const barHeight = (d.value / maxVal) * chartHeight;
            return (
              <g key={i}>
                <rect
                  x={i * (barWidth + 10)}
                  y={chartHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill="var(--btn-bg)"
                />
                <text
                  x={i * (barWidth + 10) + barWidth / 2}
                  y={chartHeight - barHeight - 5}
                  textAnchor="middle"
                  fill="#333"
                  fontSize="12"
                >
                  {d.value}
                </text>
                <text
                  x={i * (barWidth + 10) + barWidth / 2}
                  y={chartHeight + 15}
                  textAnchor="middle"
                  fill="#333"
                  fontSize="12"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

/* ==================== AI Widget Component ==================== */
function AiWidget({ onClose }) {
  const [conversation, setConversation] = useState(() => {
    const stored = localStorage.getItem("aiConversation");
    return stored ? JSON.parse(stored) : [{ sender: "ai", text: "Hello! How can I help you today?" }];
  });
  const [inputText, setInputText] = useState("");
  useEffect(() => {
    localStorage.setItem("aiConversation", JSON.stringify(conversation));
  }, [conversation]);
  const handleSend = () => {
    if (inputText.trim() === "") return;
    const newConversation = [...conversation, { sender: "user", text: inputText }];
    newConversation.push({ sender: "ai", text: "I'm here to help! (This is a simulated response.)" });
    setConversation(newConversation);
    setInputText("");
  };
  return (
    <section>
      <Modal onClose={onClose} ariaLabel="AI Help">
        <div className="ai-widget">
          <h3>AI Help Agent</h3>
          <div className="chat-window">
            {conversation.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type your question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

/* ==================== Footer Component ==================== */
function Footer({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation();
  return (
    <footer>
      <div className="footer-social">
        <p>{t('Connect with us on Social Media')}</p>
        <div className="social-links">
          <a href="#" aria-label="Facebook">Facebook</a>
          <a href="#" aria-label="Twitter">Twitter</a>
          <a href="#" aria-label="Instagram">Instagram</a>
        </div>
      </div>
      <div className="footer-legal">
        <a href="#">Terms &amp; Conditions</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Legal Notices</a>
      </div>
      <p>&copy; 2025 Maxx Energy. All rights reserved.</p>
      <button onClick={toggleDarkMode} style={{ marginTop: '10px', fontSize: '0.8rem', background: 'none', border: '1px solid var(--input-border)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
        Toggle {darkMode ? "Light" : "Dark"} Mode
      </button>
    </footer>
  );
}

/* ==================== Main App Component ==================== */
function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAiWidget, setShowAiWidget] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const storedPref = localStorage.getItem("darkMode");
    return storedPref ? JSON.parse(storedPref) : false;
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    document.title = `Maxx Energy - ${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}`;
  }, [currentTab]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Service Worker Registration (PWA support)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered: ', registration);
          })
          .catch(registrationError => {
            console.log('Service Worker registration failed: ', registrationError);
          });
      });
    }
  }, []);

  // Google Analytics Integration
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=YOUR_GA_TRACKING_ID";
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    gtag("js", new Date());
    gtag("config", "YOUR_GA_TRACKING_ID");
  }, []);

  // Hotjar Integration
  useEffect(() => {
    const HOTJAR_ID = 123456;
    (function(h, o, t, j, a, r) {
      h.hj = h.hj || function() { (h.hj.q = h.hj.q || []).push(arguments); };
      h._hjSettings = { hjid: HOTJAR_ID, hjsv: 6 };
      a = o.getElementsByTagName('head')[0];
      r = o.createElement('script'); r.async = 1;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      a.appendChild(r);
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
  }, []);

  // Slideshow Images
  const images = [
    '/slideshow/1.jpeg',
    '/slideshow/2.jpeg',
    '/slideshow/3.jpeg',
    '/slideshow/4.jpeg',
    '/slideshow/5.jpeg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const sampleUsers = [
    { email: 'usayd@maxxenergy.com', password: 'password', name: 'Usayd' },
    { email: 'admin@maxxenergy.com', password: 'password1', name: 'Admin' }
  ];

  const handleLogin = (email, password) => {
    const foundUser = sampleUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      if (window.gtag) {
        window.gtag("event", "login", { event_category: "authentication", event_label: email });
      }
      setUser(foundUser);
      setIsLoggedIn(true);
      setCurrentTab('dashboard');
      return { success: true };
    } else {
      return { success: false, message: 'Invalid email or password.' };
    }
  };

  const handleRegister = (email, password) => {
    if (window.gtag) {
      window.gtag("event", "register", { event_category: "authentication", event_label: email });
    }
    alert(`Registered ${email} successfully!`);
    return { success: true };
  };

  const handleForgot = (email) => {
    if (window.gtag) {
      window.gtag("event", "forgot_password", { event_category: "authentication", event_label: email });
    }
    alert(`Password reset link sent to ${email}`);
  };

  const handleNewsletter = (email) => {
    if (window.gtag) {
      window.gtag("event", "subscribe_newsletter", { event_category: "authentication", event_label: email });
    }
    alert(`Subscribed ${email} to our newsletter!`);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentTab('home');
  };

  const handleSearch = () => {
    if (window.gtag) {
      window.gtag("event", "search", { event_category: "navigation", event_label: searchQuery });
    }
    alert(`Searching for: ${searchQuery} energy rates`);
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' energy rates')}`, '_blank');
  };

  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<Spinner />}>
        <Helmet>
          <title>Maxx Energy - {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}</title>
          <meta name="description" content="Maxx Energy provides innovative energy solutions for a sustainable future." />
          <meta name="keywords" content={getMetaKeywords(currentTab)} />
          <meta property="og:title" content="Maxx Energy" />
          <meta property="og:description" content="Innovative energy solutions for a sustainable future." />
          <meta property="og:image" content="/Branding/MAXX-Energy-Logo-1B.png" />
        </Helmet>
        <div className="app-container">
          <Navigation
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            openLoginModal={() => setShowAuthModal(true)}
            isLoggedIn={isLoggedIn}
            user={user}
            handleLogout={handleLogout}
          />
          <main className="main-content">
            {currentTab === 'home' && <HomeSection images={images} currentSlide={currentSlide} />}
            {currentTab === 'about' && <AboutSection />}
            {currentTab === 'services' && <ServicesSection />}
            {currentTab === 'careers' && <CareersSection />}
            {currentTab === 'contact' && <ContactSection />}
            {currentTab === 'dashboard' && (
              <Suspense fallback={<Spinner />}>
                <DashboardSectionLazy searchQuery={searchQuery} />
              </Suspense>
            )}
          </main>
          {showAuthModal && (
            <AuthModal
              onClose={() => setShowAuthModal(false)}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onForgot={handleForgot}
              onNewsletter={handleNewsletter}
            />
          )}
          {showAiWidget && <AiWidget onClose={() => setShowAiWidget(false)} />}
          <Footer darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <button className="ai-help-btn" onClick={() => setShowAiWidget(true)}>
            AI Help
          </button>
        </div>
      </Suspense>
    </I18nextProvider>
  );

}

export default App;
