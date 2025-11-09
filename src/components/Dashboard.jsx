import React from 'react';
import { GripVertical, Pencil, Save, Trash2 } from 'lucide-react';
import ChartRenderer from './ChartRenderer';
import { useLocalStorage } from './useLocalStorage';

// Draggable dashboard with CSS Grid and per-card controls
export default function Dashboard() {
  const [cards, setCards] = useLocalStorage('dashboard_cards', []);

  const updateCard = (id, patch) => {
    setCards(cards.map(c => c.id === id ? { ...c, ...patch, layout: { ...c.layout, ...(patch.layout||{}) } } : c));
  };
  const removeCard = (id) => setCards(cards.filter(c => c.id !== id));

  // Drag & drop reorder
  const onDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDrop = (e, targetId) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === targetId) return;
    const from = cards.findIndex(c => c.id === draggedId);
    const to = cards.findIndex(c => c.id === targetId);
    if (from === -1 || to === -1) return;
    const next = [...cards];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setCards(next);
  };

  const gridCols = 6; // responsive using Tailwind utilities

  return (
    <div>
      {cards.length === 0 ? (
        <div className="p-6 text-center text-gray-600 border rounded-lg bg-white">No saved visualizations yet. Use the Chat to create and save charts.</div>
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
        >
          {cards.map(card => (
            <div
              key={card.id}
              className="bg-white rounded-lg border shadow-sm overflow-hidden group"
              style={{ gridColumn: `span ${Math.min(Math.max(card.layout?.colSpan || 2, 1), gridCols)} / span ${Math.min(Math.max(card.layout?.colSpan || 2, 1), gridCols)}` }}
              draggable
              onDragStart={(e)=>onDragStart(e, card.id)}
              onDragOver={(e)=>e.preventDefault()}
              onDrop={(e)=>onDrop(e, card.id)}
              aria-label={`Visualization card ${card.title}`}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400" aria-hidden />
                  <input
                    aria-label="Edit title"
                    className="bg-transparent px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    value={card.title}
                    onChange={(e)=>updateCard(card.id, { title: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Columns</label>
                  <input
                    type="range"
                    min={1}
                    max={gridCols}
                    value={card.layout?.colSpan || 2}
                    onChange={(e)=>updateCard(card.id, { layout: { colSpan: Number(e.target.value) } })}
                    aria-label="Set column span"
                  />
                  <button
                    onClick={()=>removeCard(card.id)}
                    className="inline-flex items-center gap-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                    aria-label="Remove card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <ChartRenderer spec={card.spec} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
