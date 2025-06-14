// client/src/components/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { initSocket, sendMessage } from '../api/socket';
import { useAuth } from '../stores/auth';

export default function Chat({ selectedUserId }) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newContent, setNewContent] = useState('');
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // 0) Don't render anything until we have both user and a selected peer
  if (!user || !selectedUserId) {
    return <div style={{ padding: 16 }}>Loading chat…</div>;
  }

  // 1) Fetch initial conversation history
  useEffect(() => {
    axios
      .get(`${API_URL}/conversations/${selectedUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        setMessages(res.data);
        scrollToBottom();
      })
      .catch(console.error);
  }, [selectedUserId, token]);

  // 2) Socket.IO listener
  useEffect(() => {
    const socket = initSocket(token);

    const handler = msg => {
      if (
        (msg.senderId === selectedUserId && msg.receiverId === user.id) ||
        (msg.senderId === user.id && msg.receiverId === selectedUserId)
      ) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      }
    };

    socket.on('message:receive', handler);
    return () => {
      socket.off('message:receive', handler);
      // note: don't disconnect here if you want to stay connected across chats
    };
  }, [selectedUserId, token, user.id]);

  // Utility to scroll
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Sending a message
  const handleSend = () => {
    const content = newContent.trim();
    if (!content) return;

    // Optimistic update
    const optimistic = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId: selectedUserId,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    scrollToBottom();

    // Emit
    sendMessage({ to: selectedUserId, content });

    setNewContent('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {messages.map(m => (
          <div
            key={m.id}
            style={{
              maxWidth: '70%',
              padding: '8px 12px',
              borderRadius: 16,
              boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
              alignSelf: m.senderId === user.id ? 'flex-end' : 'flex-start',
              backgroundColor: m.senderId === user.id ? '#DCF8C6' : '#FFF',
            }}
          >
            {m.content}
            <div style={{ fontSize: '0.7em', color: '#888', marginTop: 4, textAlign: 'right' }}>
              {new Date(m.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', padding: 8, borderTop: '1px solid #ddd' }}>
        <input
          type="text"
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message…"
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 20,
            border: '1px solid #ccc',
            outline: 'none',
            marginRight: 8,
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            border: 'none',
            backgroundColor: '#007bff',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
