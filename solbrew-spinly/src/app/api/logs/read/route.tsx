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

export async function GET() {
  try {
    const data = await fs.readFile(logsFile, 'utf-8');
    const logs: LogEntry[] = JSON.parse(data);
    return NextResponse.json(logs, { status: 200 });
  } catch (err) {
    console.error('Error reading logs:', err);
    return NextResponse.json({ error: 'No logs found' }, { status: 404 });
  }
}