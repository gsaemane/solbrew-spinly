import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const logsFile = path.join(process.cwd(), 'public', 'logs.json');

interface LogEntry {
  timestamp: string;
  itemId: string;
  itemName: string;
  isWinner: boolean;
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { timestamp, itemId, itemName, isWinner, quantity } = body;

    // Validate input
    if (!timestamp || !itemId || !itemName || typeof isWinner !== 'boolean' || typeof quantity !== 'number') {
      return NextResponse.json({ error: 'Invalid log data' }, { status: 400 });
    }

    // Read existing logs
    let logs: LogEntry[] = [];
    try {
      const data = await fs.readFile(logsFile, 'utf-8');
      logs = JSON.parse(data);
    } catch (err) {
      // File doesn't exist yet, start with empty array
      logs = [];
    }

    // Append new log
    const newLog: LogEntry = { timestamp, itemId, itemName, isWinner, quantity };
    logs.push(newLog);

    // Write back to file
    await fs.writeFile(logsFile, JSON.stringify(logs, null, 2));

    return NextResponse.json({ message: 'Log saved' }, { status: 200 });
  } catch (err) {
    console.error('Error writing log:', err);
    return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
  }
}