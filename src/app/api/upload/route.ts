import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const filename: string | null = data.get('filename') as string;

    if (!file || !filename) {
      return NextResponse.json({ success: false, error: 'File and filename are required' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file to public/images/[filename]
    // Note: In a real production environment hosted on Vercel, this won't persist across deployments. 
    // You would use AWS S3, Cloudinary, or Vercel Blob instead. But for local/demo, this works perfectly!
    const path = join(process.cwd(), 'public/images', filename);
    await writeFile(path, buffer);

    console.log(`Successfully uploaded ${filename} to ${path}`);

    return NextResponse.json({ success: true, message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error during file upload:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
