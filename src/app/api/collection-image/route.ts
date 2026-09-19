import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name');

  if (!name) {
    return new NextResponse('Missing name parameter', { status: 400 });
  }

  // Define allowed extensions in order of preference
  const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  // Base path for public images
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  
  // Find the first matching file
  let matchedFile = null;
  let matchedExt = null;
  
  for (const ext of extensions) {
    const filePath = path.join(imagesDir, `${name}${ext}`);
    if (fs.existsSync(filePath)) {
      matchedFile = filePath;
      matchedExt = ext;
      break;
    }
  }

  if (!matchedFile) {
    return new NextResponse('Image not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(matchedFile);
  
  // Determine content type
  let contentType = 'image/jpeg';
  if (matchedExt === '.png') contentType = 'image/png';
  if (matchedExt === '.webp') contentType = 'image/webp';

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
