import React from 'react';

// Lightweight chart renderer without external deps using SVG
// Supports: bar, line, pie, scatter, table

function clamp(v, min, max){
  return Math.max(min, Math.min(max, v));
}

export default function ChartRenderer({ spec }) {
  if (!spec) return null;
  const { type, data = [], xKey, yKey, title, labels = [], valueKey, color = '#3b82f6' } = spec;

  if (type === 'table') {
    if (!Array.isArray(data) || data.length === 0) {
      return <div className="text-sm text-gray-500">No data</div>;
    }
    const cols = Object.keys(data[0]);
    return (
      <div className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {cols.map(c => (
                <th key={c} className="px-3 py-2 font-semibold text-gray-700">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                {cols.map(c => (
                  <td key={c} className="px-3 py-2 text-gray-800">{String(row[c])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (['bar','line','scatter','pie'].includes(type)) {
    const width = 520;
    const height = 260;
    const padding = 32;

    if (type === 'pie') {
      const total = data.reduce((s, v) => s + (Number(v[valueKey])||0), 0) || 1;
      const center = { x: width/2, y: height/2 };
      const radius = Math.min(width, height)/2 - 10;
      let angle = 0;
      const segments = data.map((d, i) => {
        const val = Number(d[valueKey]) || 0;
        const slice = (val/total) * Math.PI * 2;
        const x1 = center.x + radius * Math.cos(angle);
        const y1 = center.y + radius * Math.sin(angle);
        const x2 = center.x + radius * Math.cos(angle + slice);
        const y2 = center.y + radius * Math.sin(angle + slice);
        const large = slice > Math.PI ? 1 : 0;
        const path = `M ${center.x} ${center.y} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
        const seg = { path, d, i, startAngle: angle, endAngle: angle + slice };
        angle += slice;
        return seg;
      });
      const palette = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#a3e635'];
      return (
        <svg role="img" aria-label={title || 'Pie chart'} width={width} height={height} className="max-w-full">
          {segments.map((s, i) => (
            <path key={i} d={s.path} fill={palette[i % palette.length]} />
          ))}
          {labels?.length === data.length && segments.map((s, i) => {
            const mid = (s.startAngle + s.endAngle)/2;
            const lx = width/2 + (radius*0.6) * Math.cos(mid);
            const ly = height/2 + (radius*0.6) * Math.sin(mid);
            return <text key={`l-${i}`} x={lx} y={ly} textAnchor="middle" className="fill-white text-xs font-semibold">{labels[i]}</text>;
          })}
        </svg>
      );
    }

    const xs = data.map(d => d[xKey]);
    const ys = data.map(d => Number(d[yKey]) || 0);
    const xUnique = Array.from(new Set(xs));
    const yMax = Math.max(1, ...ys);

    const xScale = (x) => {
      const idx = xUnique.indexOf(x);
      const bw = (width - padding*2) / Math.max(1, xUnique.length);
      return padding + idx * bw + (type==='bar' ? bw/2 : 0);
    };
    const yScale = (y) => height - padding - (clamp(y,0,yMax)/yMax)*(height - padding*2);

    return (
      <svg role="img" aria-label={title || `${type} chart`} width={width} height={height} className="max-w-full">
        {/* Axes */}
        <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#e5e7eb" />
        <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#e5e7eb" />
        {/* X labels */}
        {xUnique.map((x, i) => (
          <text key={i} x={xScale(x)} y={height-padding+16} className="fill-gray-500 text-xs" textAnchor="middle">{x}</text>
        ))}
        {/* Y grid */}
        {[0,0.25,0.5,0.75,1].map((p,i)=>{
          const y = padding + (1-p)*(height - padding*2);
          return <line key={i} x1={padding} x2={width-padding} y1={y} y2={y} stroke="#f3f4f6" />
        })}

        {type === 'bar' && data.map((d, i) => {
          const bw = (width - padding*2) / Math.max(1, xUnique.length) * 0.6;
          const x = xScale(d[xKey]) - bw/2;
          const y = yScale(Number(d[yKey]) || 0);
          const h = height - padding - y;
          return <rect key={i} x={x} y={y} width={bw} height={h} fill={color} rx="4" />;
        })}

        {type === 'line' && (
          <>
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={data.map(d => `${xScale(d[xKey])},${yScale(Number(d[yKey])||0)}`).join(' ')}
            />
            {data.map((d,i)=> (
              <circle key={i} cx={xScale(d[xKey])} cy={yScale(Number(d[yKey])||0)} r="3" fill={color} />
            ))}
          </>
        )}

        {type === 'scatter' && data.map((d,i)=> (
          <circle key={i} cx={xScale(d[xKey])} cy={yScale(Number(d[yKey])||0)} r="4" fill={color} />
        ))}
      </svg>
    );
  }

  return <div className="text-sm text-gray-500">Unsupported chart type</div>;
}
