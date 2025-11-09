import React, { useMemo } from 'react';
import Layout from './components/Layout';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import { useLocalStorage } from './components/useLocalStorage';

export default function App() {
  const [cards, setCards] = useLocalStorage('dashboard_cards', []);

  const handleSaveVis = (vis) => {
    setCards([...cards, vis]);
  };

  return (
    <Layout
      children={<Chat onSaveVisualization={handleSaveVis} />}
      secondary={<Dashboard />}
    />
  );
}
