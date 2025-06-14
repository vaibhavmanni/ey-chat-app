// client/src/App.jsx
import { useState, useEffect } from 'react'
import { useAuth } from './stores/auth'
import Login    from './pages/Login'
import Signup   from './pages/Signup'
import Contacts from './pages/Contacts'
import Chat     from './pages/Chat'

export default function App() {
  const { user, logout, initializing } = useAuth()
  const [selectedUserId, setSelected] = useState(null)
  const [mode, setMode]               = useState('login') // 'login' or 'signup'

  // 0) Reset body styles so we control background & text color
  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.backgroundColor = '#f0f2f5'
    document.body.style.color = '#000'
  }, [])

  // Full-screen flex container
  const outerStyle = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
    overflow: 'auto',
  }

  // Card for auth forms
  const authCardStyle = {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: 24,
  }

  // Card for the chat app
  const chatCardStyle = {
    width: '100%',
    maxWidth: 1000,
    height: '90vh',
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    display: 'flex',
  }

  // 1) Show loading while validating session
  if (initializing) {
    return (
      <div style={outerStyle}>
        <div style={authCardStyle}>
          <div style={{ textAlign: 'center' }}>Loading session…</div>
        </div>
      </div>
    )
  }

  // 2) Not signed in → show centered login/signup card
  if (!user) {
    return (
      <div style={outerStyle}>
        <div style={authCardStyle}>
          {mode === 'login'
            ? <Login onSwitch={setMode} />
            : <Signup onSwitch={setMode} />
          }
        </div>
      </div>
    )
  }

  // 3) Signed in → show centered chat card
  return (
    <div style={outerStyle}>
      <div style={chatCardStyle}>
        {/* Sidebar */}
        <div
          style={{
            maxWidth: '300 px',
            borderRight: '1px solid #ccc',
            overflowY: 'auto'
          }}
        >
          <Contacts 
            onSelect={setSelected}
            selectedUserId={selectedUserId}
          />
        </div>

        {/* Main chat area */}
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
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>Welcome, {user.username}</div>
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

          {/* Either the Chat component or a placeholder */}
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
      </div>
    </div>
  )
}
