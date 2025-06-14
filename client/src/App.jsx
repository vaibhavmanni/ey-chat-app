// client/src/App.jsx
import { useState } from 'react';
import { useAuth } from './stores/auth';
import Login from './pages/Login';
import Contacts from './pages/Contacts';
import Chat from './pages/Chat';

export default function App() {
  const { user } = useAuth();
  const [selectedUserId, setSelected] = useState(null);

  if (!user) return <Login />;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: 200, borderRight: '1px solid #ccc' }}>
        <Contacts onSelect={setSelected} />
      </div>
      <div style={{ flex: 1 }}>
        {selectedUserId
          ? <Chat selectedUserId={selectedUserId} />
          : <div style={{ padding: 20 }}>Select a user to chat.</div>}
      </div>
    </div>
  );
}
