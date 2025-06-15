import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../stores/auth';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';

export default function Login({ onSwitch }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }
    try {
      const res = await api.post('/auth/login', { username, password });
      await login(res.data.token);
    } catch {
      setError('Invalid credentials.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 360, margin: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <h2 style={{ textAlign: 'center' }}>Log In</h2>
      {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
      <Input
        name="username"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <Input
        type="password"
        name="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <Button type="submit">Log In</Button>
      <div style={{ textAlign: 'center' }}>
        <a
          href="#"
          onClick={() => onSwitch('signup')}
          style={{ fontSize: '0.8rem', color: '#007bff' }}
        >
          Don’t have an account? Sign up
        </a>
      </div>
    </form>
  );
}
