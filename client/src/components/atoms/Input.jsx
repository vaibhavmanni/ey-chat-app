import React from 'react';

export default function Input({ type = 'text', name, placeholder, value, onChange, style, ...props }) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        padding: 8,
        borderRadius: 4,
        border: '1px solid #ccc',
        outline: 'none',
        ...style
      }}
      {...props}
    />
  );
}
