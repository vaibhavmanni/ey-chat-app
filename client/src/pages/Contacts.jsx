// client/src/pages/Contacts.jsx
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../stores/auth';

export default function Contacts({ onSelect }) {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    api.get('/users').then(r => {
      // exclude yourself
      setList(r.data.filter(u => u.id !== user.id));
    });
  }, [user]);

  const containerStyle = {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: '#fff'
  };

  const itemStyle = (isHovered) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    cursor: 'pointer',
    backgroundColor: isHovered ? '#f5f5f5' : 'transparent',
    transition: 'background-color 0.2s',
  });

  const avatarStyle = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  };

  const nameStyle = {
    fontSize: 16,
    color: '#333',
    userSelect: 'none'
  };

  return (
    <div style={containerStyle}>
      {list.map(u => {
        const initials = `${u.firstName[0] || ''}${u.lastName[0] || ''}`;
        const isHovered = hoveredId === u.id;

        return (
          <div
            key={u.id}
            style={itemStyle(isHovered)}
            onMouseEnter={() => setHoveredId(u.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelect(u.id)}
          >
            <div style={avatarStyle}>
              {initials}
            </div>
            <div style={nameStyle}>
              {u.firstName} {u.lastName}
            </div>
          </div>
        );
      })}
    </div>
  );
}
