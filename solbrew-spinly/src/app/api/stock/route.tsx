import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
//import fs from 'fs';
//import path from 'path';

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  color: string;
  image?: string;
  isWinner: boolean;
}

//const stockFilePath = path.join(process.cwd(), 'public', 'stock.json');

//USING NETLIFY FOR STORAGE

export async function GET() {
  try {
    const store = getStore('stock');
    const { blobs } = await store.list();
    const items: StockItem[] = await Promise.all(
      blobs.map(async (blob) => await store.get(blob.key, { type: 'json' }))
    ).then((items) => items.filter(Boolean)); // Remove null entries
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error reading stock:', error);
    return NextResponse.json({ error: 'Failed to read stock' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const items: StockItem[] = await request.json();
    const store = getStore('stock');
    // Validate for duplicate IDs
    const ids = items.map((item) => item.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
      return NextResponse.json({ error: `Duplicate IDs: ${duplicates.join(', ')}` }, { status: 400 });
    }
    // Clear existing stock
    const { blobs } = await store.list();
    await Promise.all(blobs.map((blob) => store.delete(blob.key)));
    // Save new stock
    await Promise.all(
      items.map((item) => store.setJSON(`item-${item.id}`, item))
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving stock:', error);
    return NextResponse.json({ error: 'Failed to save stock' }, { status: 500 });
  }
}


// USING FILE SYSTEM FOR STORAGE
// // GET: Fetch stock items
// export async function GET() {
//   try {
//     const data = fs.readFileSync(stockFilePath, 'utf-8');
//     const items: StockItem[] = JSON.parse(data);
//     const filteredItems = items.filter(item => item.quantity > 0);
//     return NextResponse.json(filteredItems);
//   } catch (error) {
//     console.error('Error reading stock:', error);
//     return NextResponse.json({ error: 'Failed to fetch stock' }, { status: 500 });
//   }
// }

// // POST: Update stock items

// export async function POST(request: NextRequest) {
//   try {
//     const items = await request.json();
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const ids = items.map((item: any) => item.id);
//     const duplicates = ids.filter((id: string, index: number) => ids.indexOf(id) !== index);
//     if (duplicates.length > 0) {
//       return NextResponse.json({ error: 'Duplicate IDs detected: ' + duplicates.join(', ') }, { status: 400 });
//     }
//     await fs.writeFileSync(stockFilePath, JSON.stringify(items, null, 2));
//     return NextResponse.json({ message: 'Stock updated' }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to save stock: ' + (error as Error).message }, { status: 500 });
//   }
// }