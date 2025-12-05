'use client';

import { useEffect, useState } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk';

export default function HomePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    try {
      const lp = retrieveLaunchParams();
      setData(lp.initData);
    } catch (e) {
      // Не в Telegram — dev-режим
      setData({
        user: { id: 123456789, first_name: 'Test', username: 'testuser' },
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'mock_hash_for_dev',
      });
    }
  }, []);

  const user = data?.user;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">✅ Mini App работает!</h1>
      {user ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p>Привет, <strong>{user.first_name}</strong>!</p>
          <p>ID: {user.id}</p>
          {user.username && <p>@{user.username}</p>}
        </div>
      ) : (
        <p className="text-gray-500">Загрузка...</p>
      )}
    </div>
  );
}