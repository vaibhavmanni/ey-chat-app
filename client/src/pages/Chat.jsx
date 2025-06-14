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
  const { user, token } = useAuth();
  const [messages, setMessages]     = useState([]);
  const [newContent, setNewContent] = useState('');
  const [hasMore, setHasMore]       = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const containerRef  = useRef(null);
  const firstLoadRef  = useRef(true);
  const prevLengthRef = useRef(0);

  // Don’t render until we know who’s chatting
  if (!user || !selectedUserId) {
    return <div style={{ padding: 16 }}>Loading chat…</div>;
  }

  // 1) Scroll-to-bottom logic (initial load + new messages only)
  useLayoutEffect(() => {
    const c = containerRef.current;
    if (!c) return;

    if (firstLoadRef.current && messages.length > 0) {
      // initial load
      c.scrollTop = c.scrollHeight;
      firstLoadRef.current = false;
    } else if (
      messages.length > prevLengthRef.current &&
      !loadingOlder
    ) {
      // new message at bottom
      c.scrollTop = c.scrollHeight;
    }

    prevLengthRef.current = messages.length;
  }, [messages, loadingOlder]);

  // 2) Fetch the most recent messages on user switch
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

  // 3) Load older when scrolled to top
  const loadOlder = useCallback(async () => {
    if (!hasMore || loadingOlder || messages.length === 0) return;

    const container = containerRef.current;
    const prevScrollHeight = container.scrollHeight;
    const prevScrollTop    = container.scrollTop;

    setLoadingOlder(true);
    try {
      const res = await api.get(
        `/conversations/${selectedUserId}`,
        {
          params: {
            before: messages[0].createdAt,
            limit: PAGE_SIZE
          }
        }
      );
      const older = res.data;
      setMessages(prev => [...older, ...prev]);
      setHasMore(older.length === PAGE_SIZE);

      // restore the user's position
      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
      });
    } catch (err) {
      console.error('Error loading older messages', err);
    } finally {
      setLoadingOlder(false);
    }
  }, [hasMore, loadingOlder, messages, selectedUserId]);

  // 4) Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => {
      if (container.scrollTop < 50) {
        loadOlder();
      }
    };
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [loadOlder]);

  // 5) Socket listener → just append; scroll is handled by useLayoutEffect
  useEffect(() => {
    const socket = initSocket(token);
    const handler = msg => {
      const isRelevant =
        (msg.senderId === selectedUserId && msg.receiverId === user.id) ||
        (msg.senderId === user.id && msg.receiverId === selectedUserId);
      if (isRelevant) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on('message:receive', handler);
    return () => {
      socket.off('message:receive', handler);
      socket.disconnect?.();
    };
  }, [selectedUserId, token, user.id]);

  // 6) Send handler → optimistic UI + scroll via layout-effect
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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
