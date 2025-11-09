import React, { useMemo, useRef, useState } from 'react';
import { Send, Save, BarChart2, LineChart, PieChart, ScatterChart } from 'lucide-react';
import ChartRenderer from './ChartRenderer';
import { uid, useLocalStorage } from './useLocalStorage';

// Mocked AI that turns a natural question into a chart spec deterministically
function mockedAI(question) {
  const q = question.toLowerCase();
  const seed = [...q].reduce((a,c)=>a+c.charCodeAt(0),0);
  const types = ['bar','line','pie','scatter'];
  const type = types[seed % types.length];
  const categories = ['A','B','C','D','E','F'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];

  if (q.includes('pie')) {
    const data = categories.slice(0,5).map((c,i)=>({ label:c, value: ((seed+i)%7)+1 }));
    return { type:'pie', data, valueKey:'value', labels: data.map(d=>d.label), title:'Category Share' };
  }
  if (q.includes('scatter')) {
    const data = months.map((m,i)=>({ m, v: ((seed%5)+1)*i + (i%3)*2 }));
    return { type:'scatter', data, xKey:'m', yKey:'v', title:'Trend Scatter' };
  }
  if (q.includes('line')) {
    const data = months.map((m,i)=>({ m, v: ((seed%7)+2)*(Math.sin(i/2)+1.2) }));
    return { type:'line', data, xKey:'m', yKey:'v', title:'Monthly Line' };
  }
  // default bar
  const data = categories.slice(0,6).map((c,i)=>({ cat:c, val: ((seed%9)+1)*(i%4+1) }));
  return { type: type==='pie'?'bar':type, data, xKey:'cat', yKey:'val', title:'Category Bars' };
}

export default function Chat({ onSaveVisualization }) {
  const [messages, setMessages] = useLocalStorage('chat_messages', []);
  const [input, setInput] = useState('Show monthly revenue as a line chart');
  const [pendingSpec, setPendingSpec] = useState(null);
  const listRef = useRef(null);

  const iconFor = (t) => {
    switch(t){
      case 'bar': return <BarChart2 className="w-4 h-4" />;
      case 'line': return <LineChart className="w-4 h-4" />;
      case 'pie': return <PieChart className="w-4 h-4" />;
      case 'scatter': return <ScatterChart className="w-4 h-4" />;
      default: return null;
    }
  };

  const submit = (e) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q) return;
    const spec = mockedAI(q);
    const msg = { id: uid('msg'), role:'user', content:q };
    const reply = { id: uid('msg'), role:'assistant', content:'Generated a visualization based on your question.', spec };
    setMessages([...messages, msg, reply]);
    setPendingSpec(spec);
    setInput('');
    setTimeout(()=>{
      listRef.current?.lastElementChild?.scrollIntoView({ behavior:'smooth' });
    }, 0);
  };

  const save = () => {
    if (!pendingSpec) return;
    const vis = { id: uid('vis'), title: pendingSpec.title || 'Untitled', createdAt: Date.now(), spec: pendingSpec, layout: { colSpan: 2 } };
    onSaveVisualization?.(vis);
    setPendingSpec(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto pr-2" ref={listRef}>
        <ul className="space-y-3">
          {messages.map(m => (
            <li key={m.id} className={m.role==='user' ? 'text-right' : 'text-left'}>
              <div className={`inline-block max-w-[90%] rounded-lg px-3 py-2 text-sm shadow ${m.role==='user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border'}`}>
                <p>{m.content}</p>
                {m.spec && (
                  <div className="mt-2 bg-white rounded border overflow-hidden">
                    <ChartRenderer spec={m.spec} />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {pendingSpec && (
        <div className="mt-3 p-3 border rounded-lg bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700">
              {iconFor(pendingSpec.type)}
              <span className="font-medium">Ready to save this {pendingSpec.type}?</span>
            </div>
            <button onClick={save} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded">
              <Save className="w-4 h-4" /> Save to Dashboard
            </button>
          </div>
          <div className="mt-2 bg-white rounded border overflow-hidden">
            <ChartRenderer spec={pendingSpec} />
          </div>
        </div>
      )}

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          aria-label="Ask a data question"
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="Ask about data statistics, aggregation, trends..."
          className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-medium px-3 py-2 rounded">
          <Send className="w-4 h-4" /> Send
        </button>
      </form>
    </div>
  );
}
