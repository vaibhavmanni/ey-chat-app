// client/src/pages/Contacts.jsx
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../stores/auth';

export default function Contacts({ onSelect, selectedUserId }) {
  const { user } = useAuth();
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get('/users').then(r => {
      setList(r.data.filter(u => u.id !== user.id));
    });
  }, [user]);

  const containerStyle = {
    height: '100%',        // fill parent height (the chat-card sidebar)
    overflowY: 'auto',     // enable scrollbar when needed
    backgroundColor: '#fff'
  };

  const itemBase = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

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
        const initials = `${u.firstName[0] || ''}${u.lastName[0] || ''}`.toUpperCase();
        const isSelected = u.id === selectedUserId;

        return (
          <div
            key={u.id}
            onClick={() => onSelect(u.id)}
            style={{
              ...itemBase,
              backgroundColor: isSelected
                ? '#e3f2fd'       // light-blue highlight for the active chat
                : 'transparent'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = isSelected ? '#e3f2fd' : '#f5f5f5'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = isSelected ? '#e3f2fd' : 'transparent'}
          >
            <div style={avatarStyle}>{initials}</div>
            <div style={nameStyle}>
              {u.firstName} {u.lastName}
            </div>
          </div>
        );
      })}
    </div>
  );
}
