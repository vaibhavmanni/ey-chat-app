import React from 'react';
import Avatar from '../atoms/Avatar';

export default function SideBar({ users, selectedUserId, onSelect, style }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', backgroundColor: '#fff', ...style }}>
      {users.map(u => {
        const name = `${u.firstName} ${u.lastName}`;
        const isSelected = u.id === selectedUserId;
        return (
          <div
            key={u.id}
            onClick={() => onSelect(u.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = isSelected ? '#e3f2fd' : '#f5f5f5'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = isSelected ? '#e3f2fd' : 'transparent'}
          >
            <Avatar name={name} />
            <span style={{ fontSize: 16, color: '#333', userSelect: 'none' }}>{name}</span>
          </div>
        );
      })}
    </div>
  );
}
