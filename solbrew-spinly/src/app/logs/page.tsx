'use client';

import { useState, useEffect } from 'react';

interface LogEntry {
  timestamp: string;
  itemId: string;
  itemName: string;
  isWinner: boolean;
  quantity: number;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs/read');
        if (!response.ok) {
          throw new Error('Failed to fetch logs');
        }
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Failed to load logs: ' + (err as Error).message);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-[#D5AE60]">Spin and Prize Logs</h1>
      {error ? (
        <p className="text-red-500 p-4 bg-red-100 border-2 border-red-500 rounded-md">{error}</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">No logs available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#0A0A0A] text-[#D5AE60]">
                <th className="p-2 border border-[#EB1C24]">Timestamp</th>
                <th className="p-2 border border-[#EB1C24]">Item ID</th>
                <th className="p-2 border border-[#EB1C24]">Item Name</th>
                <th className="p-2 border border-[#EB1C24]">Outcome</th>
                <th className="p-2 border border-[#EB1C24]">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index} className="even:bg-[#EB1C24] odd:bg-[#000000] text-white">
                  <td className="p-2 border border-[#EB1C24]">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-2 border border-[#EB1C24]">{log.itemId}</td>
                  <td className="p-2 border border-[#EB1C24]">{log.itemName}</td>
                  <td className="p-2 border border-[#EB1C24]">{log.isWinner ? 'Winner' : 'Non-Winner'}</td>
                  <td className="p-2 border border-[#EB1C24]">{log.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}