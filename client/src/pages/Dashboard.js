import React from 'react';
import './Dashboard.css';
 
export default function Dashboard({ pins, currentUser, onBack, onLogout }) {
 
  const visited    = pins.filter(p => p.type === 'visited');
  const wishlist   = pins.filter(p => p.type === 'wishlist');
  const withPhotos = pins.filter(p => p.image && p.image !== "");
  const avgRating  = visited.length
    ? (visited.reduce((sum, p) => sum + Number(p.rating), 0) / visited.length).toFixed(1)
    : "N/A";
  const topRated   = [...visited].sort((a, b) => b.rating - a.rating)[0];
  const recentPins = [...pins]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
 
  return (
    <div className="dashboard-page">
 
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <button className="btn-back" onClick={onBack}>← Back to Map</button>
          <span className="dashboard-logo">🗺</span>
          <span className="dashboard-title">Travel Log — Dashboard</span>
        </div>
        <div className="dashboard-header-right">
          <div className="user-avatar">{currentUser.username[0].toUpperCase()}</div>
          <span className="username-label">{currentUser.username}</span>
          <button className="btn-logout-dash" onClick={onLogout}>Logout</button>
        </div>
      </div>
 
      {/* ── Main Content ── */}
      <div className="dashboard-content">
 
        <div className="dashboard-welcome">
          <h2>Welcome back, {currentUser.username}! 👋</h2>
          <p>Here's a summary of your travel journey so far.</p>
        </div>
 
        {/* ── Stat Cards ── */}
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-icon">🗺</span>
            <span className="stat-number total">{pins.length}</span>
            <span className="stat-label">Total pins</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📍</span>
            <span className="stat-number visited">{visited.length}</span>
            <span className="stat-label">Places visited</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🔖</span>
            <span className="stat-number wishlist">{wishlist.length}</span>
            <span className="stat-label">Wishlist places</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⭐</span>
            <span className="stat-number rating">{avgRating}</span>
            <span className="stat-label">Avg rating</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📸</span>
            <span className="stat-number photos">{withPhotos.length}</span>
            <span className="stat-label">Pins with photos</span>
          </div>
        </div>
 
        {/* ── Two Column Grid ── */}
        <div className="dashboard-grid">
 
          {/* Top Rated Place */}
          <div className="dash-card">
            <h3>🏆 Top Rated Place</h3>
            {topRated ? (
              <>
                {topRated.image && (
                  <img className="top-rated-img" src={topRated.image} alt={topRated.title} />
                )}
                <p className="top-rated-title">{topRated.title}</p>
                <p className="top-rated-desc">{topRated.description}</p>
                <div className="stars">{'⭐'.repeat(topRated.rating)}</div>
              </>
            ) : (
              <p className="no-data">No visited places yet.</p>
            )}
          </div>
 
          {/* Visited vs Wishlist + Rating Breakdown */}
          <div className="dash-card">
            <h3>📊 Visited vs Wishlist</h3>
            {pins.length > 0 ? (
              <>
                <div className="progress-section">
                  <div className="progress-row">
                    <span>📍 Visited</span>
                    <span>{visited.length} ({Math.round(visited.length / pins.length * 100)}%)</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill visited"
                      style={{ width: `${Math.round(visited.length / pins.length * 100)}%` }}
                    />
                  </div>
                </div>
 
                <div className="progress-section">
                  <div className="progress-row">
                    <span>🔖 Wishlist</span>
                    <span>{wishlist.length} ({Math.round(wishlist.length / pins.length * 100)}%)</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill wishlist"
                      style={{ width: `${Math.round(wishlist.length / pins.length * 100)}%` }}
                    />
                  </div>
                </div>
 
                <div className="rating-breakdown">
                  <h4>Rating breakdown</h4>
                  {[5,4,3,2,1].map(star => {
                    const count = pins.filter(p => Number(p.rating) === star).length;
                    const pct   = pins.length ? Math.round(count / pins.length * 100) : 0;
                    return (
                      <div className="rating-row" key={star}>
                        <span className="star-label">{star}⭐</span>
                        <div className="progress-track" style={{ flex: 1 }}>
                          <div className="progress-fill rating" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="rating-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="no-data">No pins yet.</p>
            )}
          </div>
 
          {/* Recent Activity */}
          <div className="dash-card full-width">
            <h3>🕐 Recent Activity</h3>
            {recentPins.length > 0 ? (
              <div className="activity-list">
                {recentPins.map(p => (
                  <div className="activity-item" key={p._id}>
                    {p.image ? (
                      <img className="activity-thumb" src={p.image} alt={p.title} />
                    ) : (
                      <div className={`activity-icon ${p.type}`}>
                        {p.type === 'wishlist' ? '🔖' : '📍'}
                      </div>
                    )}
                    <div className="activity-info">
                      <p className="activity-title">{p.title}</p>
                      <p className="activity-desc">
                        {p.description.length > 65
                          ? p.description.slice(0, 65) + '...'
                          : p.description}
                      </p>
                    </div>
                    <div className="activity-meta">
                      <div className="activity-stars">{'⭐'.repeat(p.rating)}</div>
                      <span className={`activity-type ${p.type}`}>
                        {p.type === 'wishlist' ? 'Wishlist' : 'Visited'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No pins yet. Go add some on the map!</p>
            )}
          </div>
 
        </div>
      </div>
    </div>
  );
}
 