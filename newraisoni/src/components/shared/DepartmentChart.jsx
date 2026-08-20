import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const DepartmentChart = ({ data = [], title = 'Analytics Chart', dataKey = 'value', nameKey = 'name' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-[#18201B] uppercase tracking-wider">{title}</h4>
        <div className="p-8 text-center text-xs text-[#66706A] bg-[#F8FAF9] rounded-xl border border-[#E1E7E2]">
          No data available for chart visualization.
        </div>
      </div>
    );
  }

  const colors = ['#1F6B32', '#0284C7', '#D97706', '#9333EA', '#DC2626', '#059669'];

  return (
    <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-4">
      <h4 className="text-xs font-bold text-[#18201B] uppercase tracking-wider">{title}</h4>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <XAxis dataKey={nameKey} tick={{ fontSize: 11, fill: '#66706A' }} />
            <YAxis tick={{ fontSize: 11, fill: '#66706A' }} allowDecimals={false} />
            <Tooltip
              cursor={false}
              contentStyle={{ backgroundColor: '#18201B', color: '#FFF', borderRadius: '8px', fontSize: '12px', border: 'none' }}
            />
            <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
