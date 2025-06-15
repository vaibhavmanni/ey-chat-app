export default function Button({ type = 'button', onClick, children, style, ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        padding: 10,
        borderRadius: 4,
        border: 'none',
        backgroundColor: '#007bff',
        color: '#fff',
        cursor: 'pointer',
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
}
