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
  const [messages, setMessages]       = useState([]);
  const [newContent, setNewContent]   = useState('');
  const [hasMore, setHasMore]         = useState(true);
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
      c.scrollTop = c.scrollHeight;
      firstLoadRef.current = false;
    } else if (messages.length > prevLengthRef.current && !loadingOlder) {
      c.scrollTop = c.scrollHeight;
    }
    prevLengthRef.current = messages.length;
  }, [messages, loadingOlder]);

  // 2) Fetch recent on user switch
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

        // reset our first-load logic so we scroll to bottom
        firstLoadRef.current = true;
      } catch (err) {
        console.error(err);
      }
    }
    fetchRecent();
    return () => { cancelled = true; };
  }, [selectedUserId]);

  // 3) Load older on scroll-to-top
  const loadOlder = useCallback(async () => {
    if (!hasMore || loadingOlder || messages.length === 0) return;

    const container = containerRef.current;
    const prevHeight = container.scrollHeight;
    const prevTop    = container.scrollTop;

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
      setMessages(prev => [...res.data, ...prev]);
      setHasMore(res.data.length === PAGE_SIZE);

      // restore scroll to where you were
      requestAnimationFrame(() => {
        const newHeight = container.scrollHeight;
        container.scrollTop = newHeight - prevHeight + prevTop;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOlder(false);
    }
  }, [hasMore, loadingOlder, messages, selectedUserId]);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const onScroll = () => { if (c.scrollTop < 50) loadOlder(); };
    c.addEventListener('scroll', onScroll);
    return () => c.removeEventListener('scroll', onScroll);
  }, [loadOlder]);

  // 4) ONE-TIME socket hookup (no disconnect on user switch)
  useEffect(() => {
    const socket = initSocket(token);

    const handler = incoming => {
      setMessages(prev => {
        // if this matches a temp-ID placeholder, replace it
        const idx = prev.findIndex(
          m => m.id.startsWith('temp-') && m.content === incoming.content
        );
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = incoming;
          return copy;
        }
        // otherwise append
        return [...prev, incoming];
      });
    };

    socket.on('message:receive', handler);
    // <-- note: no socket.disconnect() here, we only off() on unmount
    return () => {
      socket.off('message:receive', handler);
    };
  }, [token, user.id]);

  // 5) Send handler – keep optimistic placeholder
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
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8
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
            marginRight: 8,
            outline: 'none'
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
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
