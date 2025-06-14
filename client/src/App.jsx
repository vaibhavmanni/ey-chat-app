// client/src/App.jsx
import { useState } from 'react'
import { useAuth } from './stores/auth'
import Login   from './pages/Login'
import Signup  from './pages/Signup'
import Contacts from './pages/Contacts'
import Chat     from './pages/Chat'

export default function App() {
  const { user, logout, initializing } = useAuth()
  const [selectedUserId, setSelected] = useState(null)
  const [mode, setMode]               = useState('login')  // 'login' or 'signup'

  // 1) While we’re checking token → show loader
  if (initializing) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        Loading session…
      </div>
    )
  }

  // 2) If not signed in → show Login/Signup switcher
  if (!user) {
    return mode === 'login'
      ? <Login  onSwitch={setMode} />
      : <Signup onSwitch={setMode} />
  }

  // 3) Authenticated UI
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div
        style={{
          width: 200,
          borderRight: '1px solid #ccc',
          overflowY: 'auto'
        }}
      >
        <Contacts onSelect={setSelected} />
      </div>

      {/* Main area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',    // ensure full-height for flex children
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: '8px 16px',
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
              padding: '4px 8px',
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
              flex: 1,                   // fill remaining vertical space
              display: 'flex',           // allow Chat to stretch
              flexDirection: 'column',
              overflow: 'hidden'         // hide any overflow so Chat's own scroll shows
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
  )
}
