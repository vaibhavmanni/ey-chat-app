import Avatar from '../atoms/Avatar';
import Button from '../atoms/Button';

export default function Header({
  isMobile,
  onMenuClick,
  chatUserName,
  loggedInUserFullName,
  onLogout,
  style
}) {
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
          }}
        >
          ☰
        </button>
      )}

      {/* center: current chat partner */}
      <div style={{
        flex: 1,
        textAlign: 'center',
        fontWeight: '500',
        fontSize: '1.1rem',
        color: '#333'
      }}>
        {chatUserName || 'Select a chat'}
      </div>

      {/* your own avatar + sign out */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div title={loggedInUserFullName} style={{ marginRight: '0.25rem' }}>
          <Avatar name={loggedInUserFullName} size={32} />
        </div>
        <Button onClick={onLogout} style={{ padding: '6px 12px', fontSize: '0.9rem', backgroundColor: 'rgb(146, 0, 0)' }}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
