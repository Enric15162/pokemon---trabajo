import React from 'react';

export function Navbar({ activeTab, setActiveTab, coins }) {
  const tabs = [
    { id: 'arena', label: 'Arena', icon: '⚔' },
    { id: 'tournament', label: 'Torneo', icon: '🏆' },
    { id: 'shop', label: 'Sobres', icon: '✦' },
    { id: 'album', label: 'Colección', icon: '▤' },
    { id: 'help', label: 'Guía', icon: '?' },
  ];

  return (
    <nav className="navbar" aria-label="Navegación principal">
      <div className="nav-brand-wrap">
        <div className="nav-brand-icon" aria-hidden="true">✦</div>
        <div className="nav-brand">NEXUS <span>TCG</span></div>
      </div>

      <div className="nav-menu">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="coins-badge" aria-label={`${coins} monedas`}><span aria-hidden="true">◈</span> {coins}</div>
    </nav>
  );
}