import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';


import { getStore } from '@netlify/blobs';


export async function GET() {
  try {
    const store = getStore('logs');
    const { blobs } = await store.list();
    const logs = await Promise.all(
      blobs.map(async (blob) => {
        const log = await store.get(blob.key, { type: 'json' });
        return log ? { ...log, id: blob.key } : null;
      })
    );
    const validLogs = logs.filter(Boolean); // Remove null entries
    return NextResponse.json(validLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  } catch (error) {
    console.error('Error reading logs:', error);
    return NextResponse.json({ error: 'Failed to read logs' }, { status: 500 });
  }
}

//READ LOGS FROM NETLIFY BLOBS


//READ LOGS FROM STORAGE
// const logsFile = path.join(process.cwd(), 'public', 'logs.json');

// interface LogEntry {
//   timestamp: string;
//   itemId: string;
//   itemName: string;
//   isWinner: boolean;
//   quantity: number;
// }

// export async function GET() {
//   try {
//     const data = await fs.readFile(logsFile, 'utf-8');
//     const logs: LogEntry[] = JSON.parse(data);
//     return NextResponse.json(logs, { status: 200 });
//   } catch (err) {
//     console.error('Error reading logs:', err);
//     return NextResponse.json({ error: 'No logs found' }, { status: 404 });
//   }
// }