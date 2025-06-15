// client/src/pages/Signup.jsx
import { useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../stores/auth'

export default function Signup({ onSwitch }) {
  const { login } = useAuth()
  const [form, setForm] = useState({
    username: '', password: '',
    firstName: '', lastName: '', email: '',
  })
  const [error, setError] = useState('')

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const { username, password, firstName, lastName, email } = form
    if (!username || !password || !firstName || !lastName || !email)
      return 'All fields are required.'
    if (password.length < 6)
      return 'Password must be at least 6 characters.'
    if (!/\S+@\S+\.\S+/.test(email))
      return 'Email looks invalid.'
    return ''
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const msg = validate()
    if (msg) return setError(msg)
    try {
      await api.post('/auth/register', form)
      // 2) auto-login
      const loginRes = await api.post('/auth/login', {
        username: form.username,
        password: form.password
      })
      // 3) store token & redirect
      await login(loginRes.data.token)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
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
      <h2 style={{ textAlign: 'center' }}>Sign Up</h2>
      {error && (
        <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
      )}
      <input
        name="firstName"
        placeholder="First Name"
        value={form.firstName}
        onChange={handleChange}
        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
      />
      <input
        name="lastName"
        placeholder="Last Name"
        value={form.lastName}
        onChange={handleChange}
        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
      />
      <input
        name="email"
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={handleChange}
        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
      />
      <input
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
      />
      <input
        name="password"
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={handleChange}
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
        Create Account
      </button>
      <div style={{ textAlign: 'center' }}>
        <a
          href="#"
          onClick={() => onSwitch('login')}
          style={{ fontSize: "0.8rem", color: '#007bff' }}
        >
          Already have an account? Log in
        </a>
      </div>
    </form>
  )
}
