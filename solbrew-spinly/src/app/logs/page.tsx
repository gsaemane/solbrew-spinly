'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [searchQuery, setSearchQuery] = useState('');

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


  // Function to download logs as a CSV file
function downloadLogs(logs: LogEntry[]) {
    const csvContent = [
      'ID,Item Name,Status,Timestamp',
      ...logs.map((log) =>
        `${log.itemId},"${log.itemName}",${log.isWinner ? 'Winner' : 'Non-Winner'},${log.timestamp}`
      ),
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spin_logs_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

// Clear logs with confirmation
const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      setLogs([]);
    }
};

  return (
    <div className="p-6 max-w-4xl mx-auto">
       <div className="bg-gray-900 my-3 w-[120px] rounded p-2 text-[#5452c6] hover:bg-gray-800 hover:cursor-pointer">
            <Link
                href={'/stock'}
                
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#5452c6" className="inline -mt-1 mr-1" viewBox="0 0 256 256"><path d="M80,56v96L32,104Z" opacity="0.2"></path><path d="M128,96H88V56a8,8,0,0,0-13.66-5.66l-48,48a8,8,0,0,0,0,11.32l48,48A8,8,0,0,0,88,152V112h40a88.1,88.1,0,0,1,88,88,8,8,0,0,0,16,0A104.11,104.11,0,0,0,128,96ZM72,132.69,43.31,104,72,75.31Z"></path></svg> back
            </Link>
            
       </div>

      <h1 className="text-3xl font-bold mb-4 text-[#D5AE60]">Spin and Prize Logs</h1>
      {error ? (
        <p className="text-red-500 p-4 bg-red-100 border-2 border-red-500 rounded-md">{error}</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">No logs available.</p>
      ) : (
        <div className="overflow-x-auto">

           
            
            <div className="float-right">
                {/* Download Logs Button */}
                <button
                  onClick={() => downloadLogs(logs)}
                  className="mb-4 mr-4 px-4 py-2 bg-gray-800  rounded-md hover:bg-gray-600 hover:cursor-pointer text-[#5452c6] hover:text-[#9f9dff]"
                >
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#5452c6" className="inline mr-1 " viewBox="0 0 256 256"><path d="M216,48V208H40V48A16,16,0,0,1,56,32H200A16,16,0,0,1,216,48Z" opacity="0.2"></path><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"></path></svg>
                  Download Logs
                </button>

                {/* Clear logs */}
                <button
                    onClick={clearLogs}
                    className="mb-4 px-4 py-2 bg-red-100  rounded-md hover:bg-red-600 hover:cursor-pointer text-red-600 hover:text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ED4040" className="inline mr-1" viewBox="0 0 256 256"><path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56Z" opacity="0.2"></path><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>
                    Clear Logs
                </button>

            </div>
            
            

            

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