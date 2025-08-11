import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
//import fs from 'fs';
//import path from 'path';
import { v4 as uuidv4 } from 'uuid';


//USING NETLIFY BLOB FOR STORAGE
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const store = getStore('uploads');
    const key = `upload-${uuidv4()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    await store.set(key, arrayBuffer, { metadata: { name: file.name, type: file.type } });
    // Return a URL to access the blob (Netlify Blobs serve blobs via a URL)
    const blobUrl = `/api/blob/uploads/${key}`; // We’ll create a proxy endpoint
    return NextResponse.json({ success: true, path: blobUrl });
  } catch (error) {
    console.error('Error uploading to Blobs:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

//USING FILE SYSTEM FOR STORAGE
// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('file') as File | null;

//     if (!file) {
//       return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//     }

//     const uploadDir = path.join(process.cwd(), 'public', 'uploads');
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     const fileName = `${uuidv4()}-${file.name}`;
//     const filePath = path.join(uploadDir, fileName);
//     const bytes = await file.arrayBuffer();
//     fs.writeFileSync(filePath, Buffer.from(bytes));

//     return NextResponse.json({ path: `/uploads/${fileName}` });
//   } catch (error) {
//     console.error('Upload error:', error);
//     return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
//   }
// }