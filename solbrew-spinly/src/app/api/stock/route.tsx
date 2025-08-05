import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface StockItem {
  id: number;
  name: string;
  quantity: number;
  color: string;
  image?: string;
}

const stockFilePath = path.join(process.cwd(), 'public', 'stock.json');

// GET: Fetch stock items
export async function GET() {
  try {
    const data = fs.readFileSync(stockFilePath, 'utf-8');
    const items: StockItem[] = JSON.parse(data);
    const filteredItems = items.filter(item => item.quantity > 0);
    return NextResponse.json(filteredItems);
  } catch (error) {
    console.error('Error reading stock:', error);
    return NextResponse.json({ error: 'Failed to fetch stock' }, { status: 500 });
  }
}

// POST: Update stock items
export async function POST(request: NextRequest) {
  try {
    const items: StockItem[] = await request.json();
    fs.writeFileSync(stockFilePath, JSON.stringify(items, null, 2));
    return NextResponse.json({ message: 'Stock updated' });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}