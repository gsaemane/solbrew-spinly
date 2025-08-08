import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  color: string;
  image?: string;
  isWinner: boolean;
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
    const items = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ids = items.map((item: any) => item.id);
    const duplicates = ids.filter((id: string, index: number) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
      return NextResponse.json({ error: 'Duplicate IDs detected: ' + duplicates.join(', ') }, { status: 400 });
    }
    await fs.writeFileSync(stockFilePath, JSON.stringify(items, null, 2));
    return NextResponse.json({ message: 'Stock updated' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save stock: ' + (error as Error).message }, { status: 500 });
  }
}