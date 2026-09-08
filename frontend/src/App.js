import React, { useState, useEffect } from 'react';

const API_BASE = "https://it-support-shg-api.onrender.com/api";

const TOOLKIT_CARDS = [
  {
    title: "UPI Merchant Soundbox Setup",
    icon: "💳",
    summary: "How to link SHG joint accounts with merchant apps, generate QR standees, and avoid voice confirmation fraud.",
    readTime: "6 min read",
    link: "/toolkits/upi-merchant-soundbox.html"
  },
  {
    title: "ONDC & GeM Portal Onboarding",
    icon: "🛍️",
    summary: "Direct access to government procurement and India's open e-commerce network with zero heavy commission cuts.",
    readTime: "8 min read",
    link: "/toolkits/ondc-gem-onboarding.html"
  },
  {
    title: "WhatsApp Business Product Catalogs",
    icon: "📱",
    summary: "Create instant photo catalogs with fixed pricing and automated quick-replies to capture direct customer orders on chat.",
    readTime: "5 min read",
    link: "/toolkits/whatsapp-business-catalogs.html"
  },
  {
    title: "Daily Bookkeeping & Inventory Sheet",
    icon: "📊",
    summary: "Ledger and spreadsheet templates to track daily raw material purchases, sales profits, and member dividend shares.",
    readTime: "7 min read",
    link: "/toolkits/daily-bookkeeping-inventory.html"
  },
  {
    title: "Cyber Fraud & Scam Defense",
    icon: "🛡️",
    summary: "Learn how to identify fake customer payment screenshots, phishing SMS links, and prevent unauthorized account access.",
    readTime: "6 min read",
    link: "/toolkits/cyber-fraud-scam-defense.html"
  },
  {
    title: "Free Social Media Branding with AI",
    icon: "🎨",
    summary: "Step-by-step guide on making packaging labels, stickers, and festival marketing posters using Canva & free AI tools.",
    readTime: "6 min read",
    link: "/toolkits/social-media-branding-ai.html"
  }
];

// 1. Comprehensive Business Sectors (All 12 Options Restored)
const BUSINESS_SECTORS = [
  "Information Technology (IT) & Software Services",
  "Digital Marketing, Web & Data Solutions",
  "Handicrafts, Handloom & Artisan Goods",
  "Food Processing, Organic Farming & Spices",
  "Textiles, Apparel & Boutique Manufacturing",
  "Eco-Friendly, Bamboo & Recycled Products",
  "Dairy, Poultry, Fisheries & Animal Husbandry",
  "Retail, Kirana, Groceries & Local Logistics",
  "Beauty, Herbal Cosmetics & Wellness",
  "Light Engineering, Repairs & Renewable Energy",
  "Skill Training, Education & Consulting",
  "Other Micro-Enterprise"
];

// 2. Core IT Bottlenecks & Help Needed Categories (All 9 Options Restored)
const HELP_CATEGORIES = [
  "Digital Payments / UPI, QR & Soundbox Setup",
  "Website Development & Landing Pages",
  "WhatsApp Business Catalog & Social Commerce",
  "Inventory Management & Automated Billing",
  "E-Commerce Listing (GeM, ONDC, Amazon, Flipkart)",
  "Cybersecurity, Scam Awareness & Phishing Defense",
  "Hardware Support (Laptop, POS, Mobile Troubleshooting)",
  "GST, Digital Invoicing & Bookkeeping Tools",
  "AI Tools for Business & Graphic Creation (Canva/Social)"
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [tickets, setTickets] = useState([]);
  const [posts, setPosts] = useState([]);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState('All');

  // Auth & Profile states
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('shg_user')) || null);
  const [authMode, setAuthMode] = useState('login');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authError, setAuthError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Complete Form States
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Micro-Entrepreneur',
    phone: '',
    businessType: BUSINESS_SECTORS[0],
    helpNeeded: HELP_CATEGORIES[0]
  });

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    businessType: BUSINESS_SECTORS[0],
    helpNeeded: HELP_CATEGORIES[0],
    role: 'Micro-Entrepreneur'
  });

  const [ticketForm, setTicketForm] = useState({
    title: '',
    category: HELP_CATEGORIES[0],
    description: '',
    contact: ''
  });

  const [postForm, setPostForm] = useState({
    shgName: '',
    businessType: BUSINESS_SECTORS[0],
    helpNeeded: HELP_CATEGORIES[0],
    message: '',
    lookingFor: 'Co-Founders & Business Partners',
    contact: ''
  });

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE}/tickets`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets([]);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/posts`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchPosts();
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        businessType: user.businessType || BUSINESS_SECTORS[0],
        helpNeeded: user.helpNeeded || HELP_CATEGORIES[0],
        role: user.role || 'Micro-Entrepreneur'
      });
      setTicketForm(prev => ({ ...prev, contact: user.phone || '' }));
      setPostForm(prev => ({ ...prev, contact: user.phone || '' }));
    }
  }, [user]);

  const showNotification = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed. Please check your credentials.');
        return;
      }

      localStorage.setItem('shg_token', data.token);
      localStorage.setItem('shg_user', JSON.stringify(data.user));
      setUser(data.user);
      setShowAuthModal(false);
      showNotification(`Welcome aboard, ${data.user.name}!`);
    } catch {
      setAuthError('Server is currently unreachable. Make sure backend is running.');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, ...profileForm })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('shg_user', JSON.stringify(data.user));
        setUser(data.user);
        setShowProfileModal(false);
        showNotification('Profile updated successfully!');
      }
    } catch {
      alert('Unable to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shg_token');
    localStorage.removeItem('shg_user');
    setUser(null);
    showNotification('Logged out successfully.');
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...ticketForm, 
        author: user.name,
        businessType: user.businessType || BUSINESS_SECTORS[0],
        helpNeeded: ticketForm.category
      })
    });
    setTicketForm({ title: '', category: HELP_CATEGORIES[0], description: '', contact: user.phone || '' });
    showNotification('Support request submitted! Community volunteers have been notified.');
    fetchTickets();
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...postForm, 
        author: user.name,
        contact: postForm.contact || user.phone
      })
    });
    setPostForm({ shgName: '', businessType: BUSINESS_SECTORS[0], helpNeeded: HELP_CATEGORIES[0], message: '', lookingFor: 'Co-Founders & Business Partners', contact: user.phone || '' });
    showNotification('Collaboration opportunity published to the live network!');
    fetchPosts();
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = (t.title + t.description + (t.category || '')).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSectorFilter === 'All' || t.businessType === selectedSectorFilter;
    return matchesSearch && matchesSector;
  });

  const filteredPosts = posts.filter(p => {
    const matchesSearch = (p.shgName + p.message + (p.lookingFor || '')).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSectorFilter === 'All' || p.businessType === selectedSectorFilter;
    return matchesSearch && matchesSector;
  });

  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a', overflowX: 'hidden' }}>
      
      {/* Responsive Layout Styles */}
      <style>{`
        * { box-sizing: border-box; }
        .hero-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 40px;
          align-items: center;
        }
        .two-column-workspace {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 28px;
          align-items: start;
        }
        .stats-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          text-align: center;
          gap: 20px;
        }
        .toolkits-deck {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        .why-cards-deck {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .hero-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* Mobile Screens (<= 768px) */
        @media (max-width: 768px) {
          .hero-layout {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .hero-section-box {
            padding: 36px 16px !important;
          }
          .hero-title {
            font-size: 28px !important;
            line-height: 1.25 !important;
          }
          .two-column-workspace {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .stats-container {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          .why-cards-deck {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .hero-features {
            grid-template-columns: 1fr !important;
          }
          .header-nav-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .tabs-scrollable-bar {
            overflow-x: auto !important;
            white-space: nowrap !important;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .tabs-scrollable-bar::-webkit-scrollbar {
            display: none;
          }
          .nav-tab-btn {
            padding: 10px 14px !important;
            font-size: 13px !important;
          }
          .mobile-workspace-padding {
            padding: 16px !important;
          }
        }
      `}</style>

      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div style={{ background: 'linear-gradient(90deg, #1e3a8a, #0284c7)', color: '#ffffff', padding: '8px 20px', fontSize: '13px', textAlign: 'center', fontWeight: '500' }}>
        ✨ Empowering 10,000+ Rural & Urban Self-Help Groups with Free Digital Enablement, IT Support & B2B Matchmaking.
      </div>

      {/* 2. MAIN HEADER & NAVIGATION */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="header-nav-row" style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Brand Logo */}
          <div onClick={() => setActiveTab('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '20px', boxShadow: '0 4px 10px rgba(37,99,235,0.3)', flexShrink: 0 }}>
              US
            </div>
            <div>
              <div style={{ fontSize: '19px', fontWeight: '800', letterSpacing: '-0.5px', color: '#0f172a' }}>
                UdyamSetu <span style={{ color: '#2563eb', fontSize: '14px', fontWeight: '600' }}>SHG TechBridge</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Ministry of Micro, Small & Grassroots Tech Enablement</div>
            </div>
          </div>

          {/* User Profile / Auth Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowProfileModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#1e293b' }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                  {user.name} ({user.role})
                </button>
                <button
                  onClick={handleLogout}
                  style={{ padding: '8px 14px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)', fontSize: '14px' }}
              >
                Join / Sign In
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Nav Tabs on Mobile */}
        <nav className="tabs-scrollable-bar" style={{ display: 'flex', gap: '6px', borderTop: '1px solid #f1f5f9', padding: '0 24px', maxWidth: '1280px', margin: '0 auto' }}>
          {[
            { id: 'home', label: '🏠 Overview & Motive' },
            { id: 'it-helpdesk', label: '🛠️ IT Helpdesk & Support' },
            { id: 'community', label: '🤝 Community & Matchmaking' },
            { id: 'toolkits', label: '📚 Digital Toolkits' }
          ].map(tab => (
            <button
              key={tab.id}
              className="nav-tab-btn"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 18px',
                borderRadius: '0',
                border: 'none',
                background: 'transparent',
                color: activeTab === tab.id ? '#1d4ed8' : '#64748b',
                fontWeight: activeTab === tab.id ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '3px solid #2563eb' : '3px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Floating Notification */}
      {statusMsg && (
        <div style={{ position: 'fixed', bottom: '24px', right: '20px', left: '20px', maxWidth: '420px', margin: '0 auto', backgroundColor: '#065f46', color: 'white', padding: '14px 20px', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 99, display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500', fontSize: '14px' }}>
          <span>✅</span> {statusMsg}
        </div>
      )}

      {/* 3. HERO BANNER & MOTIVE SECTION (Home Tab) */}
      {activeTab === 'home' && (
        <>
          <section className="hero-section-box" style={{ background: 'radial-gradient(circle at top right, #e0f2fe, #f8fafc 60%)', padding: '64px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <div className="hero-layout" style={{ maxWidth: '1280px', margin: '0 auto' }}>
              <div>
                <div style={{ display: 'inline-block', backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '16px' }}>
                  Connecting Grassroots Hustle with Modern Tech
                </div>
                <h1 className="hero-title" style={{ fontSize: '44px', fontWeight: '900', lineHeight: '1.15', margin: '0 0 16px', letterSpacing: '-1px', color: '#0f172a' }}>
                  Bridging the Digital Divide for <span style={{ color: '#2563eb' }}>Self-Help Groups & Micro-Entrepreneurs</span>
                </h1>
                <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', margin: '0 0 28px' }}>
                  Most small-scale creators and women-led SHGs face roadblocks in accepting online UPI payments, listing products on ONDC/GeM, building catalogs, and finding genuine business partners. 
                  <b> UdyamSetu provides free IT mentors, peer networking, and community troubleshooting</b> to turn local crafts into scalable enterprises.
                </p>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveTab('it-helpdesk')}
                    style={{ flex: '1 1 auto', minWidth: '180px', padding: '14px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 6px 16px rgba(37,99,235,0.3)' }}
                  >
                    🚀 Ask for IT Support
                  </button>
                  <button
                    onClick={() => setActiveTab('community')}
                    style={{ flex: '1 1 auto', minWidth: '180px', padding: '14px 24px', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}
                  >
                    🤝 Find Business Collaborators
                  </button>
                </div>
              </div>

              {/* Dynamic Feature Card Highlights */}
              <div className="hero-features">
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚡</div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '16px' }}>Zero-Cost Tech Help</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Post any bottleneck—from UPI QR soundbox errors to website domain setup.</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌐</div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '16px' }}>All 12+ Sectors</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>IT software, artisanal crafts, organic spices, textiles, and local retail.</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>💼</div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '16px' }}>B2B Matchmaking</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Connect with bulk buyers, raw material suppliers, and student mentors.</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🛡️</div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '16px' }}>Fraud & Scam Safety</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Educational toolkits to shield non-tech founders from digital payment frauds.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Metric Badges */}
          <section style={{ backgroundColor: '#ffffff', padding: '36px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <div className="stats-container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#2563eb' }}>1,240+</div>
                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>SHGs & Micro-Units Registered</div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#059669' }}>98.4%</div>
                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>IT Issues Resolved Rapidly</div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#d97706' }}>12+</div>
                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Industrial & Tech Domains</div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#7c3aed' }}>100% Free</div>
                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Open Community Initiative</div>
              </div>
            </div>
          </section>

          {/* Detailed Motive & User Value Section */}
          <section style={{ maxWidth: '1280px', margin: '50px auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '30px', fontWeight: '800', margin: '0 0 10px' }}>Why Does This Platform Exist?</h2>
              <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '700px', margin: '0 auto' }}>
                Traditional businesses often get left behind in the e-commerce surge because technical agencies charge hefty fees. Here is how UdyamSetu alters that reality:
              </p>
            </div>

            <div className="why-cards-deck">
              <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <span style={{ fontSize: '32px' }}>🎯</span>
                <h3 style={{ fontSize: '18px', margin: '14px 0 8px' }}>1. The Problem We Solve</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                  Micro-entrepreneurs often cannot configure merchant gateways, list on Government e-Marketplace (GeM) or ONDC, or generate WhatsApp catalogs on their own, losing out to larger competitors.
                </p>
              </div>

              <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <span style={{ fontSize: '32px' }}>🤝</span>
                <h3 style={{ fontSize: '18px', margin: '14px 0 8px' }}>2. Collaborative Matchmaking</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                  An IT entrepreneur can build an online presence for a handloom SHG in exchange for bulk corporate gifting or raw materials. Groups can form consortiums to bid for larger orders.
                </p>
              </div>

              <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <span style={{ fontSize: '32px' }}>📈</span>
                <h3 style={{ fontSize: '18px', margin: '14px 0 8px' }}>3. Real Grassroots Profit</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                  By cutting out tech middlemen and expensive software licenses, groups retain 100% of their margin, boosting the rural and urban micro-economy directly.
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 4. WORKSPACE TABS */}
      {activeTab !== 'home' && (
        <main className="mobile-workspace-padding" style={{ maxWidth: '1280px', margin: '24px auto', padding: '0 24px' }}>
          
          {/* Universal Search & Sector Filter Bar */}
          <div style={{ backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                placeholder="🔍 Search requests, services, IT questions, or SHGs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '400px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', whiteSpace: 'nowrap' }}>Filter by Industry:</span>
              <select
                value={selectedSectorFilter}
                onChange={e => setSelectedSectorFilter(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#f8fafc', fontWeight: '500' }}
              >
                <option value="All">All Sectors (IT, Handicrafts, Agro, etc.)</option>
                {BUSINESS_SECTORS.map((sec, i) => (
                  <option key={i} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TAB: IT HELPDESK */}
          {activeTab === 'it-helpdesk' && (
            <div className="two-column-workspace">
              
              {/* Request Form */}
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '700' }}>Post Technical Problem</h3>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>Get free tech assistance from IT mentors and digital volunteers.</p>

                <form onSubmit={handleTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Subject / Problem Title</label>
                    <input
                      type="text"
                      placeholder="e.g., QR Code payment failing repeatedly"
                      value={ticketForm.title}
                      onChange={e => setTicketForm({ ...ticketForm, title: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Category of Assistance</label>
                    <select
                      value={ticketForm.category}
                      onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    >
                      {HELP_CATEGORIES.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Detailed Explanation</label>
                    <textarea
                      rows="3"
                      placeholder="Provide details about what device, app, or setup is having an issue..."
                      value={ticketForm.description}
                      onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Contact WhatsApp / Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={ticketForm.contact}
                      onChange={e => setTicketForm({ ...ticketForm, contact: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 10px rgba(37,99,235,0.2)' }}
                  >
                    {user ? 'Submit IT Request' : 'Login to Post Request'}
                  </button>
                </form>
              </div>

              {/* Live Ticket Feed */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Active Technical Queries ({filteredTickets.length})</h3>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Updated in real-time</span>
                </div>

                {filteredTickets.length === 0 ? (
                  <div style={{ backgroundColor: 'white', padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                    No tickets found matching your query or filter. Submit the first one!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {filteredTickets.map((t, idx) => (
                      <div key={idx} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{t.title}</h4>
                          <span style={{ fontSize: '11px', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>
                            {t.category}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#475569', margin: '10px 0 14px', lineHeight: '1.5' }}>{t.description}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            👤 Posted by <b>{t.author || 'Anonymous'}</b>
                            {t.businessType && <span> • 🏷️ <i>{t.businessType}</i></span>}
                          </div>
                          {t.contact && (
                            <a
                              href={`https://wa.me/${t.contact.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' }}
                            >
                              💬 WhatsApp {t.contact}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: COMMUNITY & MATCHMAKING */}
          {activeTab === 'community' && (
            <div className="two-column-workspace">
              
              {/* Post Collaboration Opportunity */}
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '700' }}>Find Partners & Network</h3>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>Offer your products, seek tech partners, or find bulk buyers.</p>

                <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>SHG / Startup / Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g., RuralTech Innovations / Mahila Shilp"
                      value={postForm.shgName}
                      onChange={e => setPostForm({ ...postForm, shgName: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Sector (Including IT)</label>
                    <select
                      value={postForm.businessType}
                      onChange={e => setPostForm({ ...postForm, businessType: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    >
                      {BUSINESS_SECTORS.map((sec, i) => (
                        <option key={i} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>I Am Looking For</label>
                    <select
                      value={postForm.lookingFor}
                      onChange={e => setPostForm({ ...postForm, lookingFor: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    >
                      <option>Looking for: IT & Website Building Partner</option>
                      <option>Looking for: Co-Founders & Business Partners</option>
                      <option>Looking for: Mentors & Technical Advisors</option>
                      <option>Looking for: Bulk Institutional Buyers</option>
                      <option>Looking for: Raw Material / Component Suppliers</option>
                      <option>Looking for: Packaging & Transport Logistics</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Proposal / Pitch</label>
                    <textarea
                      rows="3"
                      placeholder="Describe what your group produces, your capacity, and how others can collaborate..."
                      value={postForm.message}
                      onChange={e => setPostForm({ ...postForm, message: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Contact WhatsApp / Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={postForm.contact}
                      onChange={e => setPostForm({ ...postForm, contact: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{ padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 10px rgba(5,150,105,0.2)' }}
                  >
                    {user ? 'Publish to Community Feed' : 'Login to Post Opportunity'}
                  </button>
                </form>
              </div>

              {/* Live Collaboration Feed */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Collaborative Propositions ({filteredPosts.length})</h3>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Connect directly via WhatsApp</span>
                </div>

                {filteredPosts.length === 0 ? (
                  <div style={{ backgroundColor: 'white', padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                    No collaboration posts found. Publish an offer on the left!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {filteredPosts.map((p, idx) => (
                      <div key={idx} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                          <div>
                            <h4 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>{p.shgName}</h4>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Sector: <b>{p.businessType}</b></span>
                          </div>
                          <span style={{ fontSize: '11px', backgroundColor: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>
                            {p.lookingFor}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#334155', margin: '12px 0 16px', lineHeight: '1.5' }}>"{p.message}"</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b', flexWrap: 'wrap', gap: '8px' }}>
                          <div>👤 Rep: <b>{p.author || 'Member'}</b></div>
                          {p.contact && (
                            <a
                              href={`https://wa.me/${p.contact.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#dcfce7', color: '#166534', padding: '5px 12px', borderRadius: '6px', textDecoration: 'none', fontWeight: '700' }}
                            >
                              📲 WhatsApp {p.contact}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: DIGITAL TOOLKITS (All 6 Restored) */}
{/* TAB: DIGITAL TOOLKITS */}
{activeTab === 'toolkits' && (
  <div>
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 8px' }}>
        Free Digital Literacy & Enablement Toolkits
      </h2>
      <p style={{ color: '#64748b', fontSize: '15px' }}>
        Simple, jargon-free guides to help micro-businesses automate and grow online.
      </p>
    </div>

    <div className="toolkits-deck">
      {TOOLKIT_CARDS.map((card, idx) => (
        <div 
          key={idx} 
          style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between' 
          }}
        >
          <div>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>{card.icon}</div>
            <h4 style={{ margin: '0 0 8px', fontSize: '17px' }}>{card.title}</h4>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px' }}>
              {card.summary}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
              ⏱️ {card.readTime}
            </span>
            <a
              href={card.link}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: 'none',
                color: '#2563eb',
                fontWeight: '700',
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Open Guide ↗
            </a>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

        </main>
      )}

      {/* 5. USER PROFILE MODAL */}
      {showProfileModal && user && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '460px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <button
              onClick={() => setShowProfileModal(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', border: 'none', background: '#f1f5f9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
            <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>Entrepreneur Profile</h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>Update your operational sector and primary help needed.</p>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>FULL NAME</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>CONTACT PHONE / WHATSAPP</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>OPERATIONAL SECTOR</label>
                <select
                  value={profileForm.businessType}
                  onChange={e => setProfileForm({ ...profileForm, businessType: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                >
                  {BUSINESS_SECTORS.map((sec, i) => (
                    <option key={i} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>PRIMARY IT ASSISTANCE NEEDED</label>
                <select
                  value={profileForm.helpNeeded}
                  onChange={e => setProfileForm({ ...profileForm, helpNeeded: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                >
                  {HELP_CATEGORIES.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}
              >
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. COMPLETE AUTH MODAL (LOGIN & SIGNUP WITH ALL INPUTS & DROPDOWNS) */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '440px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setShowAuthModal(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', border: 'none', background: '#f1f5f9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
            
            <h3 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '800' }}>
              {authMode === 'login' ? 'Welcome to UdyamSetu' : 'Register Your Enterprise'}
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              {authMode === 'login' ? 'Access your IT tickets and community pitches.' : 'Join the growing network of digitally empowered entrepreneurs.'}
            </p>

            {authError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {authMode === 'signup' && (
                <>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>FULL NAME</label>
                    <input
                      type="text"
                      placeholder="e.g., Rajesh Sharma / Sunita Devi"
                      value={authForm.name}
                      onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>WHATSAPP / PHONE NUMBER</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={authForm.phone}
                      onChange={e => setAuthForm({ ...authForm, phone: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>YOUR ROLE</label>
                    <select
                      value={authForm.role}
                      onChange={e => setAuthForm({ ...authForm, role: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    >
                      <option value="Micro-Entrepreneur">Micro-Entrepreneur (Individual Founder)</option>
                      <option value="SHG Member">Self-Help Group (SHG) Leader / Member</option>
                      <option value="IT Volunteer">IT Support Volunteer / Mentor</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>PRIMARY SECTOR (Includes IT)</label>
                    <select
                      value={authForm.businessType}
                      onChange={e => setAuthForm({ ...authForm, businessType: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    >
                      {BUSINESS_SECTORS.map((sec, i) => (
                        <option key={i} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>WHAT IT ASSISTANCE DO YOU NEED MOST?</label>
                    <select
                      value={authForm.helpNeeded}
                      onChange={e => setAuthForm({ ...authForm, helpNeeded: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    >
                      {HELP_CATEGORIES.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={authForm.email}
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>PASSWORD</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <button
                type="submit"
                style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginTop: '8px', fontSize: '14px' }}
              >
                {authMode === 'login' ? 'Sign In' : 'Create Free Account'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#64748b' }}>
              {authMode === 'login' ? "Don't have an account yet? " : "Already registered? "}
              <button
                onClick={() => { setAuthError(''); setAuthMode(authMode === 'login' ? 'signup' : 'login'); }}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '700', cursor: 'pointer' }}
              >
                {authMode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. FOOTER */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '36px 24px', marginTop: '60px', color: '#64748b', fontSize: '13px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <b style={{ color: '#0f172a' }}>UdyamSetu: IT Support for SHGs & Micro-Entrepreneurs</b>
            <div>Empowering grassroots innovation through open-source digital technology.</div>
          </div>
          <div>
            College Community Engagement Project (CEP) • 100% Free & Open-Access
          </div>
        </div>
      </footer>
    </div>
  );
}
