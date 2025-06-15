import React, {
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

  if (!user || !selectedUserId) {
    return <div style={{ padding: 16 }}>Loading chat…</div>;
  }

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

  useEffect(() => {
    let cancelled = false;
    async function fetchRecent() {
      try {
        const res = await api.get(`/conversations/${selectedUserId}`, {
          params: { limit: PAGE_SIZE }
        });
        if (cancelled) return;
        setMessages(res.data);
        setHasMore(res.data.length === PAGE_SIZE);
        firstLoadRef.current = true;
      } catch (err) {
        console.error(err);
      }
    }
    fetchRecent();
    return () => { cancelled = true; };
  }, [selectedUserId]);

  const loadOlder = useCallback(async () => {
    if (!hasMore || loadingOlder || messages.length === 0) return;
    const container = containerRef.current;
    const prevHeight = container.scrollHeight;
    const prevTop = container.scrollTop;
    setLoadingOlder(true);
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
  }, [token, user.id]);

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
      <MessageList
        ref={containerRef}
        messages={messages}
        currentUserId={user.id}
        loadingOlder={loadingOlder}
        onScrollTop={loadOlder}
      />
      <div style={{ display: 'flex', padding: 8, borderTop: '1px solid #ddd' }}>
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
