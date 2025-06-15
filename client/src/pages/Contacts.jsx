import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../stores/auth';
import SideBar from '../components/molecules/SideBar';

export default function Contacts({ onSelect, selectedUser }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/users').then(r => {
      // filter out yourself
      setUsers(r.data.filter(u => u.id !== user.id));
    });
  }, [user]);

  return (
    <SideBar
      users={users}
      selectedUserId={selectedUser?.id}
      onSelect={id => {
        const partner = users.find(u => u.id === id);
        if (partner) onSelect(partner);
      }}
    />
  );
}
