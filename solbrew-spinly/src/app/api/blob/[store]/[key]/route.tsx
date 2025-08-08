// src/app/api/blob/[store]/[key]/route.tsx
import { getStore } from '@netlify/blobs';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ store: string; key: string }> }) {
  try {
    // Await params to access store and key
    const { store, key } = await params;
    console.log(`Fetching blob from store: ${store}, key: ${key}`);

    const blobStore = getStore(store);
    const blob = await blobStore.get(key, { type: 'arrayBuffer' });

    if (!blob) {
      console.warn(`Blob not found in store: ${store}, key: ${key}`);
      return NextResponse.json({ error: 'Blob not found' }, { status: 404 });
    }

    // Get metadata and inspect its structure
    const metadata = await blobStore.getMetadata(key);
    console.log(`Blob metadata:`, metadata);

    // Safely access contentType from custom metadata or fallback
    // Assuming /api/upload sets metadata: { contentType: file.type }
    const contentType = (metadata as any)?.metadata?.contentType || 'application/octet-stream';

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    //console.error(`Error fetching blob from store: ${await params.store}, key: ${await params.key}`, error);
    return NextResponse.json({ error: 'Failed to fetch blob' }, { status: 500 });
  }
}