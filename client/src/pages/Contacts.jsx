// client/src/pages/Contacts.jsx
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../stores/auth';

export default function Contacts({ onSelect }) {
  const { user } = useAuth();
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get('/users').then(r => {
      // exclude yourself
      setList(r.data.filter(u => u.id !== user.id));
    });
  }, [user]);

  return (
    <ul>
      {list.map(u => (
        <li key={u.id} onClick={()=>onSelect(u.id)} style={{ cursor: 'pointer' }}>
          {u.username}
        </li>
      ))}
    </ul>
  );
}
