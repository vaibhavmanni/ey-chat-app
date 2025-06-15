import React, { useState, useEffect } from 'react';
import { useAuth } from './stores/auth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Contacts from './pages/Contacts';
import Chat from './pages/Chat';
import Header from './components/molecules/Header';

export default function App() {
  const { user, logout, initializing } = useAuth();
  const [selectedUserId, setSelected] = useState(null);
  const [mode, setMode] = useState('login');
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    Object.assign(document.body.style, {
      margin: 0,
      padding: 0,
      backgroundColor: '#f0f2f5',
      color: '#000'
    });
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const outerStyle = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
    overflow: 'auto',
  };

  const authCardStyle = {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: 24,
  };

  const chatCardStyle = {
    width: '100%',
    maxWidth: 1000,
    height: '90vh',
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    display: 'flex',
    position: 'relative',
  };

  if (initializing) {
    return (
      <div style={outerStyle}>
        <div style={authCardStyle}>
          <div style={{ textAlign: 'center' }}>Loading session…</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={outerStyle}>
        <div style={authCardStyle}>
          {mode === 'login'
            ? <Login onSwitch={setMode} />
            : <Signup onSwitch={setMode} />}
        </div>
      </div>
    );
  }

  return (
    <div style={outerStyle}>
      <div style={chatCardStyle}>
        {/* Desktop sidebar */}
        {!isMobile && (
          <div style={{ maxWidth: '300px', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
            <Contacts onSelect={setSelected} selectedUserId={selectedUserId} />
          </div>
        )}

        {/* Main area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Header
            isMobile={isMobile}
            onMenuClick={() => setDrawerOpen(true)}
            username={user.username}
            onLogout={logout}
          />

          {selectedUserId ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Chat selectedUserId={selectedUserId} />
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              Select a user to chat.
            </div>
          )}
        </div>

        {/* Mobile drawer */}
        {isMobile && drawerOpen && (
          <>
            <div
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1000
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '80%', maxWidth: 300,
                height: '100%',
                backgroundColor: '#fff',
                boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
                zIndex: 1001,
                overflowY: 'auto'
              }}
            >
              <Contacts
                onSelect={id => {
                  setSelected(id);
                  setDrawerOpen(false);
                }}
                selectedUserId={selectedUserId}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
