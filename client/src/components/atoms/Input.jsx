// src/components/atoms/Input.jsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  style,
  ...props
}) {
  const isPassword = type === 'password';
  const [show, setShow] = useState(false);
  const inputType = isPassword && show ? 'text' : type;

  const inputStyle = {
    padding: isPassword ? '8px 32px 8px 8px' : 8,
    borderRadius: 4,
    border: '1px solid #ccc',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    ...style,
  };

  if (isPassword) {
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={inputStyle}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          style={{
            position: 'absolute',
            top: '50%',
            right: 8,
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    );
  }

  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={inputStyle}
      {...props}
    />
  );
}
