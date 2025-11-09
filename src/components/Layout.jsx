import React, { useState } from 'react';
import { BarChart2, PanelsTopLeft, MessageSquare, Settings } from 'lucide-react';

export default function Layout({ children, secondary }) {
  const [tab, setTab] = useState('chat');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <BarChart2 className="w-5 h-5" />
            <span className="font-semibold">Insight Canvas</span>
          </div>
          <nav className="flex items-center gap-1">
            <button onClick={()=>setTab('chat')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${tab==='chat'?'bg-gray-900 text-white':'text-gray-700 hover:bg-gray-100'}`}>
              <MessageSquare className="inline w-4 h-4 mr-1"/> Chat
            </button>
            <button onClick={()=>setTab('dashboard')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${tab==='dashboard'?'bg-gray-900 text-white':'text-gray-700 hover:bg-gray-100'}`}>
              <PanelsTopLeft className="inline w-4 h-4 mr-1"/> Dashboard
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
        <section className="md:col-span-2 bg-white rounded-lg border shadow-sm p-4" aria-label="Primary content">
          {tab==='chat' ? children : secondary}
        </section>
        <aside className="md:col-span-1" aria-label="Sidebar">
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Tips</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Ask for trends, comparisons, or distribution.</li>
              <li>Try: "Show monthly revenue as a line chart"</li>
              <li>Save visuals and arrange them in the dashboard.</li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="py-6 text-center text-xs text-gray-500">Built for rapid data exploration • Keyboard friendly • Accessible</footer>
    </div>
  );
}
