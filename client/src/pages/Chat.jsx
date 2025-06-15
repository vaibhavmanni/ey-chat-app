import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback
} from 'react';
import api from '../api/axios';
import { initSocket, sendMessage } from '../api/socket';
import { useAuth } from '../stores/auth';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';
import MessageList from '../components/molecules/MessageList';

const PAGE_SIZE = 50;

export default function Chat({ selectedUserId }) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const containerRef = useRef(null);
  const firstLoadRef = useRef(true);
  const prevLengthRef = useRef(0);
  const isPrependingRef = useRef(false);

  // block until we know who’s chatting
  if (!user || !selectedUserId) {
    return <div style={{ padding: 16 }}>Loading chat…</div>;
  }

  // handle scrolling
  useLayoutEffect(() => {
    const c = containerRef.current;
    if (!c) return;

    if (firstLoadRef.current && messages.length) {
      c.scrollTop = c.scrollHeight;
      firstLoadRef.current = false;
    } else if (isPrependingRef.current) {
      isPrependingRef.current = false;
    } else if (messages.length > prevLengthRef.current) {
      c.scrollTop = c.scrollHeight;
    }

    prevLengthRef.current = messages.length;
  }, [messages]);

  // initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.get(`/conversations/${selectedUserId}`, {
        params: { limit: PAGE_SIZE }
      });
      if (cancelled) return;
      setMessages(res.data);
      setHasMore(res.data.length === PAGE_SIZE);
      firstLoadRef.current = true;
    })();
    return () => { cancelled = true; };
  }, [selectedUserId]);

  // load older when scrolled to top
  const loadOlder = useCallback(async () => {
    if (!hasMore || loadingOlder || messages.length === 0) return;
    const c = containerRef.current;
    const prevHeight = c.scrollHeight;
    const prevTop = c.scrollTop;

    setLoadingOlder(true);
    isPrependingRef.current = true;

    try {
      const res = await api.get(`/conversations/${selectedUserId}`, {
        params: {
          before: messages[0].createdAt,
          limit: PAGE_SIZE
        }
      });
      setMessages(prev => [...res.data, ...prev]);
      setHasMore(res.data.length === PAGE_SIZE);

      requestAnimationFrame(() => {
        const newHeight = c.scrollHeight;
        c.scrollTop = newHeight - prevHeight + prevTop;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOlder(false);
    }
  }, [hasMore, loadingOlder, messages, selectedUserId]);

  // socket receiver
  useEffect(() => {
    const socket = initSocket(token);
    const handler = incoming => {
      setMessages(prev => {
        const idx = prev.findIndex(
          m => m.id.startsWith('temp-') && m.content === incoming.content
        );
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = incoming;
          return copy;
        }
        return [...prev, incoming];
      });
    };
    socket.on('message:receive', handler);
    return () => socket.off('message:receive', handler);
  }, [token]);

  // send new message
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
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* only this scrolls */}
      <MessageList
        ref={containerRef}
        messages={messages}
        currentUserId={user.id}
        loadingOlder={loadingOlder}
        onScrollTop={loadOlder}
      />

      {/* fixed at bottom */}
      <div style={{
        display: 'flex',
        padding: 8,
        borderTop: '1px solid #ddd',
        backgroundColor: '#fafafa'
      }}>
        <Input
          type="text"
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message…"
          style={{ flex: 1, marginRight: 8, borderRadius: 20 }}
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
}
