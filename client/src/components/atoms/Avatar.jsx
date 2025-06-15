import React from 'react';

export default function Avatar({ name = '', size = 40, style, ...props }) {
  const initials = name
    .split(' ')
    .map(n => n[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#007bff',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        flexShrink: 0,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        ...style
      }}
      {...props}
    >
      {initials}
    </div>
  );
}
