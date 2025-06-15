import { useState, useEffect } from 'react';
import { useAuth } from './stores/auth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Contacts from './pages/Contacts';
import Chat from './pages/Chat';
import Header from './components/molecules/Header';

export default function App() {
  const { user, logout, initializing } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [mode, setMode] = useState('login');
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // global page styles
  useEffect(() => {
    Object.assign(document.body.style, {
      margin: 0,
      padding: 0,
      backgroundColor: '#f0f2f5',
      color: '#000'
    });
  }, []);

  // detect mobile
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
    overflow: 'auto',
    backgroundColor: '#f0f2f5'
  };

  const authCardStyle = {
    maxWidth: 400,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: 24
  };

  const chatCardStyle = {
    maxWidth: 1000,
    width: '100%',
    height: '90vh',
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    display: 'flex',
    position: 'relative'
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

  // not logged in?
  if (!user) {
    return (
      <div style={outerStyle}>
        <div style={authCardStyle}>
          {mode === 'login'
            ? <Login onSwitch={setMode}/>
            : <Signup onSwitch={setMode}/>}
        </div>
      </div>
    );
  }

  return (
    <div style={outerStyle}>
      <div style={chatCardStyle}>
        {/* desktop sidebar */}
        {!isMobile && (
          <div style={{ width: 300, borderRight: '1px solid #ccc' }}>
            <Contacts
              onSelect={setSelectedUser}
              selectedUser={selectedUser}
            />
          </div>
        )}

        {/* main area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Header
            isMobile={isMobile}
            onMenuClick={() => setDrawerOpen(true)}
            chatUserName={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}
            loggedInUserName={user.username}
            loggedInUserFullName={`${user.firstName} ${user.lastName}`}
            onLogout={logout}
          />

          {selectedUser ? (
            <Chat selectedUserId={selectedUser.id}/>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}>
              Select someone to chat with
            </div>
          )}
        </div>

        {/* mobile drawer */}
        {isMobile && drawerOpen && (
          <>
            <div
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                zIndex: 1000
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '80%',
                maxWidth: 300,
                height: '100%',
                backgroundColor: '#fff',
                boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
                zIndex: 1001,
                overflowY: 'auto'
              }}
            >
              <Contacts
                onSelect={u => {
                  setSelectedUser(u);
                  setDrawerOpen(false);
                }}
                selectedUser={selectedUser}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
