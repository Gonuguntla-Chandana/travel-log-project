import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import axios from 'axios';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
 
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
 
function App() {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("travellog_user")) || null
  );
  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [newEntry, setNewEntry] = useState(null);
  const [filter, setFilter] = useState("all");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");       // NEW: search
  const [showDashboard, setShowDashboard] = useState(false); // NEW: dashboard toggle
  const [viewState, setViewState] = useState({
    longitude: 78.4867,
    latitude: 17.3850,
    zoom: 12
  });
 
  const titleRef  = useRef();
  const descRef   = useRef();
  const typeRef   = useRef();
  const ratingRef = useRef();
 
  const token = localStorage.getItem("travellog_token");
 
  useEffect(() => {
    if (!currentUser) return;
    const getPins = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPins(res.data);
      } catch (err) {
        console.log("Fetch error:", err);
      }
    };
    getPins();
  }, [currentUser]);
 
  const handleLogout = () => {
    localStorage.removeItem("travellog_token");
    localStorage.removeItem("travellog_user");
    setCurrentUser(null);
    setPins([]);
  };
 
  const handleMapClick = (e) => {
    setSelectedPin(null);
    const { lng, lat } = e.lngLat;
    setNewEntry({ longitude: lng, latitude: lat });
    setImageFile(null);
    setImagePreview("");
  };
 
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
 
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title",       titleRef.current.value);
      formData.append("description", descRef.current.value);
      formData.append("rating",      ratingRef.current.value);
      formData.append("type",        typeRef.current.value);
      formData.append("latitude",    String(newEntry.latitude));
      formData.append("longitude",   String(newEntry.longitude));
      if (imageFile) formData.append("image", imageFile);
 
      const res = await axios.post(`${API_URL}/api/logs`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setPins(prev => [...prev, res.data]);
      setNewEntry(null);
      setImageFile(null);
      setImagePreview("");
    } catch (err) {
      alert("Failed to save: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };
 
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/logs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPins(pins.filter(p => p._id !== id));
      setSelectedPin(null);
    } catch (err) {
      console.log("Delete error:", err);
    }
  };
 
  // NEW: Filter by type AND search query together
  const displayedPins = pins.filter(p => {
    const matchesFilter = filter === "all" || p.type === filter;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
 
  const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.REACT_APP_MAPTILER_KEY}`;
 
  if (!currentUser) return <Login setCurrentUser={setCurrentUser} />;
 
  // NEW: Show dashboard page
  if (showDashboard) return (
    <Dashboard
      pins={pins}
      currentUser={currentUser}
      onBack={() => setShowDashboard(false)}
      onLogout={handleLogout}
    />
  );
 
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
 
      {/* ── Top Nav Bar ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        background: 'white', borderBottom: '1px solid #eee',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        gap: '10px'
      }}>
 
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '22px' }}>🗺</span>
          <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1a1a2e' }}>Travel Log</span>
        </div>
 
        {/* NEW: Search Bar */}
        <div style={{ flex: 1, maxWidth: '280px' }}>
          <input
            type="text"
            placeholder="🔍 Search pins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '7px 12px',
              borderRadius: '20px', border: '1.5px solid #ddd',
              fontSize: '13px', outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
 
        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          {[
            { value: "all",      label: "🗺 All" },
            { value: "visited",  label: "📍 Visited" },
            { value: "wishlist", label: "🔖 Wishlist" },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} style={{
              background: filter === f.value ? 'tomato' : 'white',
              color: filter === f.value ? 'white' : '#333',
              border: '1.5px solid tomato', padding: '5px 12px',
              borderRadius: '20px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '12px', transition: 'all 0.2s'
            }}>
              {f.label}
            </button>
          ))}
        </div>
 
        {/* User + Dashboard + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* NEW: Dashboard button */}
          <button onClick={() => setShowDashboard(true)} style={{
            background: '#1a1a2e', color: 'white',
            border: 'none', padding: '6px 14px',
            borderRadius: '6px', cursor: 'pointer',
            fontSize: '12px', fontWeight: 'bold'
          }}>
            📊 Dashboard
          </button>
 
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'tomato', color: 'white', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '14px'
          }}>
            {currentUser.username[0].toUpperCase()}
          </div>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
            {currentUser.username}
          </span>
          <button onClick={handleLogout} style={{
            background: 'transparent', border: '1.5px solid #ddd',
            padding: '5px 12px', borderRadius: '6px', cursor: 'pointer',
            fontSize: '12px', color: '#666'
          }}>
            Logout
          </button>
        </div>
      </div>
 
      {/* ── Search results count ── */}
      {searchQuery && (
        <div style={{
          position: 'absolute', top: '62px', left: '50%',
          transform: 'translateX(-50%)', zIndex: 10,
          background: '#1a1a2e', color: 'white',
          borderRadius: '20px', padding: '4px 14px',
          fontSize: '12px', fontWeight: 'bold'
        }}>
          {displayedPins.length} result{displayedPins.length !== 1 ? 's' : ''} for "{searchQuery}"
          <span
            onClick={() => setSearchQuery("")}
            style={{ marginLeft: '8px', cursor: 'pointer', opacity: 0.7 }}
          >✕</span>
        </div>
      )}
 
      {/* ── Stats Bar ── */}
      <div style={{
        position: 'absolute', bottom: '24px', left: '50%',
        transform: 'translateX(-50%)', zIndex: 10,
        background: 'white', borderRadius: '30px',
        padding: '8px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        display: 'flex', gap: '20px', fontSize: '13px', fontWeight: 'bold',
        whiteSpace: 'nowrap'
      }}>
        <span>🗺 Total: {pins.length}</span>
        <span>📍 Visited: {pins.filter(p => p.type === 'visited').length}</span>
        <span>🔖 Wishlist: {pins.filter(p => p.type === 'wishlist').length}</span>
      </div>
 
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%', paddingTop: '53px' }}
        mapStyle={MAP_STYLE}
      >
        <NavigationControl position="top-left" />
 
        {displayedPins.map((p) => (
          <React.Fragment key={p._id}>
            <Marker longitude={p.longitude} latitude={p.latitude} anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setNewEntry(null);
                setSelectedPin(p);
              }}
            >
              <div style={{ fontSize: '28px', cursor: 'pointer', filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.35))' }}>
                {p.type === 'wishlist' ? '🔖' : '📍'}
              </div>
            </Marker>
          </React.Fragment>
        ))}
 
        {/* Selected Pin Popup */}
        {selectedPin && (
          <Popup
            longitude={selectedPin.longitude} latitude={selectedPin.latitude}
            anchor="top" closeButton={true} onClose={() => setSelectedPin(null)}
            maxWidth="260px"
          >
            <div style={{ padding: '6px', width: '230px' }}>
              {selectedPin.image && (
                <img src={selectedPin.image} alt={selectedPin.title} style={{
                  width: '100%', height: '130px',
                  objectFit: 'cover', borderRadius: '6px', marginBottom: '8px'
                }} />
              )}
              <span style={{
                display: 'inline-block', marginBottom: '6px',
                background: selectedPin.type === 'wishlist' ? '#e8f4fd' : '#fff0ed',
                color: selectedPin.type === 'wishlist' ? '#2980b9' : 'tomato',
                fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px'
              }}>
                {selectedPin.type === 'wishlist' ? '🔖 Wishlist' : '📍 Visited'}
              </span>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px' }}>{selectedPin.title}</h3>
              <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#555' }}>{selectedPin.description}</p>
              <div style={{ color: 'gold', marginBottom: '8px' }}>{'⭐'.repeat(selectedPin.rating)}</div>
              <button onClick={() => handleDelete(selectedPin._id)} style={{
                background: '#ff4444', color: 'white', border: 'none',
                padding: '5px 12px', borderRadius: '4px', cursor: 'pointer',
                fontSize: '12px', width: '100%'
              }}>
                🗑 Delete Pin
              </button>
            </div>
          </Popup>
        )}
 
        {/* New Entry Form */}
        {newEntry && (
          <Popup
            longitude={newEntry.longitude} latitude={newEntry.latitude}
            anchor="left"
            onClose={() => { setNewEntry(null); setImagePreview(""); setImageFile(null); }}
            maxWidth="270px"
          >
            <form onSubmit={handleFormSubmit} style={{
              display: 'flex', flexDirection: 'column', gap: '7px',
              width: '240px', padding: '4px'
            }}>
              <h4 style={{ margin: 0, color: '#333' }}>📝 Add New Log</h4>
 
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Title</label>
              <input ref={titleRef} placeholder="e.g. Best Coffee Shop" required
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }} />
 
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Description</label>
              <textarea ref={descRef} placeholder="Tell your story..." required rows={2}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px', resize: 'none' }} />
 
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Type</label>
              <select ref={typeRef}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }}>
                <option value="visited">📍 Visited</option>
                <option value="wishlist">🔖 Wishlist</option>
              </select>
 
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Rating</label>
              <select ref={ratingRef}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
              </select>
 
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Photo (optional)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '12px' }} />
 
              {imagePreview && (
                <img src={imagePreview} alt="preview" style={{
                  width: '100%', height: '90px', objectFit: 'cover',
                  borderRadius: '4px', border: '1px solid #ddd'
                }} />
              )}
 
              <button type="submit" disabled={uploading} style={{
                background: uploading ? '#aaa' : 'tomato', color: 'white',
                border: 'none', padding: '8px', borderRadius: '4px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold', fontSize: '13px', marginTop: '2px'
              }}>
                {uploading ? '⏳ Uploading...' : 'Save Location'}
              </button>
            </form>
          </Popup>
        )}
      </Map>
    </div>
  );
}
 
export default App;
 