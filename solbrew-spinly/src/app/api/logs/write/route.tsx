import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
// import fs from 'fs/promises';
// import path from 'path';

// const logsFile = path.join(process.cwd(), 'public', 'logs.json');

// interface LogEntry {
//   timestamp: string;
//   itemId: string;
//   itemName: string;
//   isWinner: boolean;
//   quantity: number;
// }

//USING NETLIFY BLOB AS STORAGE
export async function POST(request: Request) {
    try {
      const { timestamp, itemId, itemName, isWinner, quantity } = await request.json();
      const store = getStore('logs');
      const key = `log-${timestamp}-${itemId}`;
      await store.setJSON(key, { timestamp, itemId, itemName, isWinner, quantity });
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error writing to Blobs:', error);
      return NextResponse.json({ error: 'Failed to write log' }, { status: 500 });
    }
}

// USING FILE SYSTEM AS STORAGE
// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { timestamp, itemId, itemName, isWinner, quantity } = body;

//     // Validate input
//     if (!timestamp || !itemId || !itemName || typeof isWinner !== 'boolean' || typeof quantity !== 'number') {
//       return NextResponse.json({ error: 'Invalid log data' }, { status: 400 });
//     }

//     // Read existing logs
//     let logs: LogEntry[] = [];
//     try {
//       const data = await fs.readFile(logsFile, 'utf-8');
//       logs = JSON.parse(data);
//     } catch {
//       // File doesn't exist yet, start with empty array
//       logs = [];
//     }

//     // Append new log
//     const newLog: LogEntry = { timestamp, itemId, itemName, isWinner, quantity };
//     logs.push(newLog);

//     // Write back to file
//     await fs.writeFile(logsFile, JSON.stringify(logs, null, 2));

//     return NextResponse.json({ message: 'Log saved' }, { status: 200 });
//   } catch (err) {
//     console.error('Error writing log:', err);
//     return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
//   }
// }