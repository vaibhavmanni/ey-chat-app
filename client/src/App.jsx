// client/src/App.jsx
import { useState, useEffect } from 'react'
import { useAuth }     from './stores/auth'
import Login           from './pages/Login'
import Signup          from './pages/Signup'
import Contacts        from './pages/Contacts'
import Chat            from './pages/Chat'

export default function App() {
  const { user, logout, initializing } = useAuth()
  const [selectedUserId, setSelected] = useState(null)
  const [mode, setMode]               = useState('login')    // 'login' or 'signup'
  const [isMobile, setIsMobile]       = useState(false)
  const [drawerOpen, setDrawerOpen]   = useState(false)

  // 0) Reset body styles
  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.backgroundColor = '#f0f2f5'
    document.body.style.color = '#000'
  }, [])

  // 1) Track viewport width
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // shared outer container
  const outerStyle = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
    overflow: 'auto',
  }

  // card around login/signup
  const authCardStyle = {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: 24,
  }

  // card around chat app
  const chatCardStyle = {
    width: '100%',
    maxWidth: 1000,
    height: '90vh',
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    display: 'flex',
    position: 'relative'
  }

  // 2) Show loader while verifying session
  if (initializing) {
    return (
      <div style={outerStyle}>
        <div style={authCardStyle}>
          <div style={{ textAlign: 'center' }}>Loading session…</div>
        </div>
      </div>
    )
  }

  // 3) Not signed in → centered login/signup
  if (!user) {
    return (
      <div style={outerStyle}>
        <div style={authCardStyle}>
          {mode === 'login'
            ? <Login  onSwitch={setMode} />
            : <Signup onSwitch={setMode} />
          }
        </div>
      </div>
    )
  }

  // 4) Signed in → chat card
  return (
    <div style={outerStyle}>
      <div style={chatCardStyle}>
        {/* Desktop sidebar */}
        {!isMobile && (
          <div
            style={{
              maxWidth: '300px',
              borderRight: '1px solid #ccc',
              overflowY: 'auto'
            }}
          >
            <Contacts
              onSelect={id => setSelected(id)}
              selectedUserId={selectedUserId}
            />
          </div>
        )}

        {/* Main area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* Header */}
          <header
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #ddd',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Mobile menu button */}
            {isMobile && (
              <button
                onClick={() => setDrawerOpen(true)}
                style={{
                  fontSize: 24,
                  marginRight: 12,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ☰
              </button>
            )}

            <div style={{ flex: 1 }}>Welcome, {user.username}</div>

            <button
              onClick={logout}
              style={{
                padding: '6px 12px',
                border: 'none',
                backgroundColor: '#e74c3c',
                color: '#fff',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </header>

          {/* Chat or placeholder */}
          {selectedUserId ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <Chat selectedUserId={selectedUserId} />
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666'
              }}
            >
              Select a user to chat.
            </div>
          )}
        </div>

        {/* Mobile drawer overlay */}
        {isMobile && drawerOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                zIndex: 1000
              }}
            />

            {/* Drawer panel */}
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
                onSelect={id => {
                  setSelected(id)
                  setDrawerOpen(false)
                }}
                selectedUserId={selectedUserId}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
