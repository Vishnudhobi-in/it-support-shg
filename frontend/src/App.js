import React, { useState, useEffect } from 'react';

const API_BASE = "https://it-support-shg-api.onrender.com/api";

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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState('All');

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('shg_user')) || null);
  const [authMode, setAuthMode] = useState('login');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authError, setAuthError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

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
    showNotification('Support request submitted!');
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
    showNotification('Collaboration opportunity published!');
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
      
      {/* Mobile-Adaptive Global Styles */}
      <style>{`
        * { box-sizing: border-box; }
        .responsive-hero {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 32px;
          align-items: center;
        }
        .responsive-grid-split {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 24px;
          align-items: start;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          text-align: center;
        }
        .cards-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .feature-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* Mobile Screens (<= 768px) */
        @media (max-width: 768px) {
          .responsive-hero {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            padding: 32px 16px !important;
          }
          .responsive-grid-split {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          .feature-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .hero-title {
            font-size: 28px !important;
            line-height: 1.25 !important;
          }
          .main-nav-container {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .tabs-scroll-bar {
            overflow-x: auto !important;
            white-space: nowrap !important;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .tabs-scroll-bar::-webkit-scrollbar {
            display: none;
          }
          .tab-btn {
            padding: 10px 14px !important;
            font-size: 13px !important;
          }
          .page-padding {
            padding: 16px 14px !important;
          }
        }
      `}</style>

      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div style={{ background: 'linear-gradient(90deg, #1e3a8a, #0284c7)', color: '#ffffff', padding: '8px 16px', fontSize: '12px', textAlign: 'center', fontWeight: '500' }}>
        ✨ Empowering 10,000+ Grassroots SHGs with Free Digital Enablement & IT Support.
      </div>

      {/* 2. MAIN HEADER & NAVIGATION */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="main-nav-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div onClick={() => setActiveTab('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '18px', flexShrink: 0 }}>
              US
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: '800', letterSpacing: '-0.5px', color: '#0f172a' }}>
                UdyamSetu <span style={{ color: '#2563eb', fontSize: '13px', fontWeight: '600' }}>SHG TechBridge</span>
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Ministry of Micro & Grassroots Tech Enablement</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowProfileModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', color: '#1e293b' }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                  {user.name.split(' ')[0]} ({user.role})
                </button>
                <button
                  onClick={handleLogout}
                  style={{ padding: '6px 10px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
              >
                Join / Sign In
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Bar on Mobile */}
        <nav className="tabs-scroll-bar" style={{ display: 'flex', borderTop: '1px solid #f1f5f9', padding: '0 16px', maxWidth: '1280px', margin: '0 auto' }}>
          {[
            { id: 'home', label: '🏠 Overview' },
            { id: 'it-helpdesk', label: '🛠️ IT Helpdesk' },
            { id: 'community', label: '🤝 Matchmaking' },
            { id: 'toolkits', label: '📚 Toolkits' }
          ].map(tab => (
            <button
              key={tab.id}
              className="tab-btn"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                color: activeTab === tab.id ? '#1d4ed8' : '#64748b',
                fontWeight: activeTab === tab.id ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2.5px solid #2563eb' : '2.5px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Floating Notification */}
      {statusMsg && (
        <div style={{ position: 'fixed', bottom: '20px', left: '16px', right: '16px', maxWidth: '400px', margin: '0 auto', backgroundColor: '#065f46', color: 'white', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 99, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '13px' }}>
          <span>✅</span> {statusMsg}
        </div>
      )}

      {/* 3. HERO BANNER & MOTIVE SECTION (Home Tab) */}
      {activeTab === 'home' && (
        <>
          <section style={{ background: 'radial-gradient(circle at top right, #e0f2fe, #f8fafc 60%)', borderBottom: '1px solid #e2e8f0' }}>
            <div className="responsive-hero" style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 20px' }}>
              <div>
                <div style={{ display: 'inline-block', backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Grassroots Hustle meets Tech
                </div>
                <h1 className="hero-title" style={{ fontSize: '38px', fontWeight: '900', lineHeight: '1.2', margin: '0 0 14px', letterSpacing: '-0.5px', color: '#0f172a' }}>
                  Bridging the Digital Divide for <span style={{ color: '#2563eb' }}>Self-Help Groups & Micro-Units</span>
                </h1>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px' }}>
                  Get free tech mentorship, digital payment setups, and discover business partners without paying expensive digital agency fees.
                </p>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveTab('it-helpdesk')}
                    style={{ flex: '1 1 auto', minWidth: '160px', padding: '12px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                  >
                    🚀 Ask for IT Support
                  </button>
                  <button
                    onClick={() => setActiveTab('community')}
                    style={{ flex: '1 1 auto', minWidth: '160px', padding: '12px 20px', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                  >
                    🤝 Find Partners
                  </button>
                </div>
              </div>

              <div className="feature-grid-2">
                <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>⚡</div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>Zero-Cost Tech Help</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Post issues from UPI QR soundbox errors to website builds.</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>🌐</div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>All 12+ Sectors</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Includes IT software, textiles, organic agriculture, and retail.</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>💼</div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>B2B Networking</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Connect with bulk buyers, raw material vendors, and student mentors.</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>🛡️</div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>Fraud Safety</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Educational toolkits shielding non-tech founders from digital scams.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Metric Badges */}
          <section style={{ backgroundColor: '#ffffff', padding: '28px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <div className="stats-grid" style={{ maxWidth: '1280px', margin: '0 auto' }}>
              <div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#2563eb' }}>1,240+</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>SHGs Registered</div>
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#059669' }}>98.4%</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Issues Resolved</div>
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#d97706' }}>12+</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Domains Covered</div>
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#7c3aed' }}>100% Free</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Community Project</div>
              </div>
            </div>
          </section>

          {/* Detailed Motive */}
          <section style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 8px' }}>Why Does This Platform Exist?</h2>
              <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '600px', margin: '0 auto' }}>
                Grassroots businesses deserve simple, cost-free digital tools without high consultancy charges.
              </p>
            </div>

            <div className="cards-grid-3">
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '28px' }}>🎯</span>
                <h3 style={{ fontSize: '16px', margin: '10px 0 6px' }}>1. The Problem</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                  Micro-entrepreneurs often cannot configure merchant gateways, list on GeM or ONDC, or generate WhatsApp catalogs independently.
                </p>
              </div>

              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '28px' }}>🤝</span>
                <h3 style={{ fontSize: '16px', margin: '10px 0 6px' }}>2. Matchmaking</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                  An IT volunteer can build a web portfolio for an SHG in exchange for handicrafts, raw supplies, or collaborative business.
                </p>
              </div>

              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '28px' }}>📈</span>
                <h3 style={{ fontSize: '16px', margin: '10px 0 6px' }}>3. Higher Profit Retention</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                  By cutting out tech middlemen and expensive software licenses, groups retain 100% of their operational margins.
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 4. WORKSPACE TABS */}
      {activeTab !== 'home' && (
        <main className="page-padding" style={{ maxWidth: '1280px', margin: '16px auto', padding: '0 20px' }}>
          
          {/* Universal Search & Sector Filter */}
          <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <input
              type="text"
              placeholder="🔍 Search requests, queries, or SHGs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', whiteSpace: 'nowrap' }}>Sector:</span>
              <select
                value={selectedSectorFilter}
                onChange={e => setSelectedSectorFilter(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#f8fafc' }}
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
            <div className="responsive-grid-split">
              
              {/* Request Form */}
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '700' }}>Post Technical Problem</h3>
                <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b' }}>Free support from IT mentors and digital volunteers.</p>

                <form onSubmit={handleTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>PROBLEM TITLE</label>
                    <input
                      type="text"
                      placeholder="e.g., QR Code payment failing"
                      value={ticketForm.title}
                      onChange={e => setTicketForm({ ...ticketForm, title: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>CATEGORY</label>
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
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>EXPLANATION</label>
                    <textarea
                      rows="3"
                      placeholder="Details regarding your device or app issue..."
                      value={ticketForm.description}
                      onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>CONTACT NUMBER</label>
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
                    style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', marginTop: '4px' }}
                  >
                    {user ? 'Submit IT Request' : 'Login to Post Request'}
                  </button>
                </form>
              </div>

              {/* Feed */}
              <div>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '700' }}>Live Help Requests ({filteredTickets.length})</h3>

                {filteredTickets.length === 0 ? (
                  <div style={{ backgroundColor: 'white', padding: '30px', textAlign: 'center', borderRadius: '10px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '13px' }}>
                    No matching requests found.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredTickets.map((t, idx) => (
                      <div key={idx} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>{t.title}</h4>
                          <span style={{ fontSize: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                            {t.category}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#475569', margin: '8px 0 12px', lineHeight: '1.4' }}>{t.description}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '11px', color: '#64748b', flexWrap: 'wrap', gap: '6px' }}>
                          <div>By <b>{t.author || 'Anonymous'}</b> {t.businessType && `• ${t.businessType}`}</div>
                          {t.contact && (
                            <a
                              href={`https://wa.me/${t.contact.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' }}
                            >
                              💬 WhatsApp
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

          {/* TAB: MATCHMAKING */}
          {activeTab === 'community' && (
            <div className="responsive-grid-split">
              
              {/* Post Form */}
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '700' }}>Find Partners & Network</h3>
                <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b' }}>Publish your proposal to the live community.</p>

                <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>SHG / STARTUP NAME</label>
                    <input
                      type="text"
                      placeholder="e.g., Mahila Weavers"
                      value={postForm.shgName}
                      onChange={e => setPostForm({ ...postForm, shgName: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>SECTOR</label>
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
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>LOOKING FOR</label>
                    <select
                      value={postForm.lookingFor}
                      onChange={e => setPostForm({ ...postForm, lookingFor: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    >
                      <option>Looking for: IT & Website Building Partner</option>
                      <option>Looking for: Co-Founders & Business Partners</option>
                      <option>Looking for: Mentors & Technical Advisors</option>
                      <option>Looking for: Bulk Institutional Buyers</option>
                      <option>Looking for: Raw Material Suppliers</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>PROPOSAL</label>
                    <textarea
                      rows="3"
                      placeholder="Describe your requirement or production capacity..."
                      value={postForm.message}
                      onChange={e => setPostForm({ ...postForm, message: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>CONTACT NUMBER</label>
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
                    style={{ padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', marginTop: '4px' }}
                  >
                    {user ? 'Publish Proposal' : 'Login to Post'}
                  </button>
                </form>
              </div>

              {/* Collaboration Feed */}
              <div>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '700' }}>Propositions ({filteredPosts.length})</h3>

                {filteredPosts.length === 0 ? (
                  <div style={{ backgroundColor: 'white', padding: '30px', textAlign: 'center', borderRadius: '10px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '13px' }}>
                    No collaboration posts found.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredPosts.map((p, idx) => (
                      <div key={idx} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                          <div>
                            <h4 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: '700' }}>{p.shgName}</h4>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{p.businessType}</span>
                          </div>
                          <span style={{ fontSize: '10px', backgroundColor: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                            {p.lookingFor}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#334155', margin: '8px 0 12px', lineHeight: '1.4' }}>"{p.message}"</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '11px', color: '#64748b', flexWrap: 'wrap', gap: '6px' }}>
                          <div>By <b>{p.author || 'Member'}</b></div>
                          {p.contact && (
                            <a
                              href={`https://wa.me/${p.contact.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' }}
                            >
                              📲 WhatsApp
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

          {/* TAB: TOOLKITS */}
          {activeTab === 'toolkits' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 6px' }}>Digital Toolkits</h2>
                <p style={{ color: '#64748b', fontSize: '13px' }}>Practical, non-technical setup guides for micro-businesses.</p>
              </div>

              <div className="cards-grid-3">
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '26px', marginBottom: '8px' }}>💳</div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '15px' }}>UPI Soundbox Setup</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>Link joint SHG bank accounts with Google Pay or PhonePe Business standees.</p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '26px', marginBottom: '8px' }}>🛍️</div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '15px' }}>ONDC / GeM Onboarding</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>Government procurement and open e-commerce listing with 0% extra commissions.</p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '26px', marginBottom: '8px' }}>📱</div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '15px' }}>WhatsApp Catalogs</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>Create instant photo catalogs with fixed rates and automated quick responses.</p>
                </div>
              </div>
            </div>
          )}

        </main>
      )}

      {/* MODAL: PROFILE */}
      {showProfileModal && user && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '440px', position: 'relative' }}>
            <button
              onClick={() => setShowProfileModal(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', border: 'none', background: '#f1f5f9', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '800' }}>Your Profile</h3>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748b' }}>Edit your contact and business details.</p>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700' }}>NAME</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '2px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700' }}>PHONE NUMBER</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '2px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700' }}>OPERATIONAL SECTOR</label>
                <select
                  value={profileForm.businessType}
                  onChange={e => setProfileForm({ ...profileForm, businessType: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '2px' }}
                >
                  {BUSINESS_SECTORS.map((sec, i) => (
                    <option key={i} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                style={{ padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AUTH */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button
              onClick={() => setShowAuthModal(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', border: 'none', background: '#f1f5f9', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
            
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '800' }}>
              {authMode === 'login' ? 'Sign In' : 'Join UdyamSetu'}
            </h3>

            {authError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '8px', borderRadius: '6px', fontSize: '12px', margin: '8px 0' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {authMode === 'signup' && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={authForm.name}
                    onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp / Contact Number"
                    value={authForm.phone}
                    onChange={e => setAuthForm({ ...authForm, phone: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <select
                    value={authForm.role}
                    onChange={e => setAuthForm({ ...authForm, role: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Micro-Entrepreneur">Micro-Entrepreneur</option>
                    <option value="SHG Member">SHG Leader / Member</option>
                    <option value="IT Volunteer">IT Volunteer / Mentor</option>
                  </select>
                </>
              )}

              <input
                type="email"
                placeholder="Email Address"
                value={authForm.email}
                onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />

              <input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />

              <button
                type="submit"
                style={{ padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', marginTop: '6px' }}
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '12px', color: '#64748b' }}>
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
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

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '24px 16px', marginTop: '40px', color: '#64748b', fontSize: '12px', textAlign: 'center' }}>
        <b style={{ color: '#0f172a' }}>UdyamSetu: IT Support for SHGs & Micro-Entrepreneurs</b>
        <div style={{ marginTop: '4px' }}>Free Open-Access College Community Engagement Project</div>
      </footer>
    </div>
  );
}
