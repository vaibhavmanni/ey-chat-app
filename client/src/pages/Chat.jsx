// client/src/pages/Chat.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect
} from 'react';
import api from '../api/axios';
import { initSocket, sendMessage } from '../api/socket';
import { useAuth } from '../stores/auth';
import Message from '../components/Message';

const PAGE_SIZE = 30;

export default function Chat({ selectedUserId }) {
  const { user, token, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const containerRef = useRef(null);
  const firstLoadRef = useRef(true);

  // 0) Don’t render until we have both user & peer
  if (!user || !selectedUserId) {
    return <div style={{ padding: 16 }}>Loading chat…</div>;
  }

  // 1) After messages mount for the first time, scroll to bottom
  useLayoutEffect(() => {
    if (firstLoadRef.current && messages.length > 0) {
      const c = containerRef.current;
      c.scrollTop = c.scrollHeight;
      firstLoadRef.current = false;
    }
  }, [messages]);

  // 2) Initial fetch of most recent messages
  useEffect(() => {
    let cancelled = false;
    async function fetchRecent() {
      try {
        const res = await api.get(
          `/conversations/${selectedUserId}`,
          { params: { limit: PAGE_SIZE } }
        );
        if (cancelled) return;
        setMessages(res.data);
        setHasMore(res.data.length === PAGE_SIZE);
      } catch (err) {
        console.error('Error fetching messages', err);
      }
    }
    fetchRecent();
    return () => { cancelled = true; };
  }, [selectedUserId]);

  // 3) Load older when scrolling to top
  const loadOlder = useCallback(async () => {
    if (!hasMore || loadingOlder || messages.length === 0) return;

    setLoadingOlder(true);
    const container = containerRef.current;
    const prevHeight = container.scrollHeight;
    const oldest = messages[0];

    try {
      const res = await api.get(
        `/conversations/${selectedUserId}`,
        { params: { before: oldest.createdAt, limit: PAGE_SIZE } }
      );
      const older = res.data;
      setMessages(prev => [...older, ...prev]);
      setHasMore(older.length === PAGE_SIZE);

      // preserve scroll position after prepend
      setTimeout(() => {
        const newHeight = container.scrollHeight;
        container.scrollTop = newHeight - prevHeight;
      }, 0);
    } catch (err) {
      console.error('Error loading older messages', err);
    } finally {
      setLoadingOlder(false);
    }
  }, [hasMore, loadingOlder, messages, selectedUserId]);

  // 4) Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    const handler = () => {
      if (container.scrollTop < 50) {
        loadOlder();
      }
    };
    container.addEventListener('scroll', handler);
    return () => container.removeEventListener('scroll', handler);
  }, [loadOlder]);

  // 5) Socket listener → append + scroll to bottom
  useEffect(() => {
    const socket = initSocket(token);
    const handler = msg => {
      const isRelevant =
        (msg.senderId === selectedUserId && msg.receiverId === user.id) ||
        (msg.senderId === user.id && msg.receiverId === selectedUserId);
      if (!isRelevant) return;

      setMessages(prev => [...prev, msg]);
      setTimeout(() => {
        const c = containerRef.current;
        c.scrollTop = c.scrollHeight;
      }, 0);
    };

    socket.on('message:receive', handler);
    return () => {
      socket.off('message:receive', handler);
      socket.disconnect?.();
    };
  }, [selectedUserId, token, user.id]);

  // 6) Send handler → optimistic UI + scroll
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
    sendMessage({ to: selectedUserId, content });
    setNewContent('');

    setTimeout(() => {
      const c = containerRef.current;
      c.scrollTop = c.scrollHeight;
    }, 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid #ddd',
        backgroundColor: '#f9f9f9'
      }}>
        <div>Chat</div>
        <div>
          <span style={{ marginRight: 12 }}>{user.username}</span>
          <button
            onClick={logout}
            style={{
              padding: '4px 8px',
              border: 'none',
              backgroundColor: '#e74c3c',
              color: '#fff',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          position: 'relative'
        }}
      >
        {loadingOlder && (
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            Loading older messages…
          </div>
        )}

        {messages.map(m => (
          <Message key={m.id} message={m} currentUserId={user.id} />
        ))}
      </div>

      {/* Input */}
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
