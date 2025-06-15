import React, { useEffect } from 'react';
import MessageBubble from '../atoms/MessageBubble';

const MessageList = React.forwardRef(({ messages, currentUserId, loadingOlder, onScrollTop, style }, ref) => {
  useEffect(() => {
    const container = ref.current;
    if (!container || !onScrollTop) return;
    const handleScroll = () => {
      if (container.scrollTop < 50) {
        onScrollTop();
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [ref, onScrollTop]);

  return (
    <div
      ref={ref}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        ...style
      }}
    >
      {loadingOlder && (
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          Loading older messages…
        </div>
      )}
      {messages.map(m => (
        <MessageBubble key={m.id} message={m} currentUserId={currentUserId} />
      ))}
    </div>
  );
});

export default MessageList;
