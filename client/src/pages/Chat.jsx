import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { initSocket, sendMessage } from '../api/socket';
import { useAuth } from '../stores/auth';
import Message from '../components/Message';

export default function Chat({ selectedUserId }) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newContent, setNewContent] = useState('');
  const endRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  if (!user || !selectedUserId) {
    return <div style={{ padding: 16 }}>Loading chat…</div>;
  }

  // Fetch history
  useEffect(() => {
    api
      .get(`/conversations/${selectedUserId}`)
      .then(res => {
        setMessages(res.data);
        scrollToBottom();
      })
      .catch(console.error);
  }, [selectedUserId]);

  // Socket listener
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
    };
  }, [selectedUserId, token, user.id]);

  const scrollToBottom = () =>
    endRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSend = () => {
    const content = newContent.trim();
    if (!content) return;

    const optimistic = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId: selectedUserId,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    scrollToBottom();

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
          <Message
            key={m.id}
            message={m}
            currentUserId={user.id}
          />
        ))}
        <div ref={endRef} />
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
