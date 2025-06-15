import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../stores/auth';
import SideBar from '../components/molecules/SideBar';

export default function Contacts({ onSelect, selectedUserId }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/users').then(r => {
      setUsers(r.data.filter(u => u.id !== user.id));
    });
  }, [user]);

  return (
    <SideBar
      users={users}
      selectedUserId={selectedUserId}
      onSelect={onSelect}
    />
  );
}
