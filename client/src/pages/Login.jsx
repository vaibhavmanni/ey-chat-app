// client/src/pages/Login.jsx
import { useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../stores/auth'

export default function Login({ onSwitch }) {
  const { login } = useAuth()
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    if (!u || !p) {
      setError('Username and password are required.')
      return
    }
    try {
      const res = await api.post('/auth/login', { username: u, password: p })
      await login(res.data.token)
    } catch (err) {
      setError('Invalid credentials.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 360,
        margin: 'auto',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}
    >
      <h2 style={{ textAlign: 'center' }}>Log In</h2>
      {error && (
        <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
      )}
      <input
        placeholder="Username"
        value={u}
        onChange={(e) => setU(e.target.value)}
        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={p}
        onChange={(e) => setP(e.target.value)}
        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
      />
      <button
        type="submit"
        style={{
          padding: 10,
          borderRadius: 4,
          border: 'none',
          backgroundColor: '#007bff',
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        Log In
      </button>
      <div style={{ textAlign: 'center' }}>
        <a
          href="#"
          onClick={() => onSwitch('signup')}
          style={{ fontSize: "0.8rem", color: '#007bff' }}
        >
          Don’t have an account? Sign up
        </a>
      </div>
    </form>
  )
}
