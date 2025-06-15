import Button from '../atoms/Button';

export default function Header({ isMobile, onMenuClick, username, onLogout, style }) {
  return (
    <header
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        ...style
      }}
    >
      {isMobile && (
        <button
          onClick={onMenuClick}
          style={{
            fontSize: 24,
            marginRight: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'black',
          }}
        >
          ☰
        </button>
      )}
      <div style={{ flex: 1 }}>{`Welcome, ${username}`}</div>
      <Button onClick={onLogout} style={{backgroundColor: 'hsl(0, 100.00%, 26.90%)'}}>Sign Out</Button>
    </header>
  );
}
