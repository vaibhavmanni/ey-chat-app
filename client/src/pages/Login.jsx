// client/src/pages/Login.jsx
import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../stores/auth';

export default function Login() {
  const { login } = useAuth();
  const [u, setU] = useState('');
  const [p, setP] = useState('');

  const submit = async e => {
    e.preventDefault();
    const res = await api.post('/auth/login', { username: u, password: p });
    login(res.data.token);
  };

  return (
    <form onSubmit={submit} style={{ padding: 20 }}>
      <input placeholder="Username" value={u} onChange={e=>setU(e.target.value)} />
      <br/>
      <input type="password" placeholder="Password" value={p} onChange={e=>setP(e.target.value)} />
      <br/>
      <button type="submit">Log In</button>
    </form>
  );
}
