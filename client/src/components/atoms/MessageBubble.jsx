export default function MessageBubble({ message, currentUserId, style, ...props }) {
  const isSent = message.senderId === currentUserId;
  return (
    <div
      style={{
        maxWidth: '70%',
        color: 'black',
        padding: '8px 12px',
        borderRadius: 16,
        boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
        alignSelf: isSent ? 'flex-end' : 'flex-start',
        backgroundColor: isSent ? '#DCF8C6' : '#FFF',
        ...style
      }}
      {...props}
    >
      {message.content}
      <div
        style={{
          fontSize: '0.7em',
          color: '#888',
          marginTop: 4,
          textAlign: 'right',
        }}
      >
        {new Date(message.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
}
