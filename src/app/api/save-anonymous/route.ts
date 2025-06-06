import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Simple file-based storage for anonymous sessions
const STORAGE_DIR = path.join(process.cwd(), 'data', 'anonymous-sessions');

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureStorageDir();
    
    const body = await request.json();
    const { 
      sessionId, 
      businessName, 
      pin, 
      email, 
      planData, 
      shareableId, 
      allowSharing 
    } = body;

    // Validate required fields
    if (!sessionId || !businessName || !pin || !planData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate PIN format (6 digits)
    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      );
    }

    const normalizedBusinessName = businessName.toLowerCase().trim();
    const sessionKey = `${normalizedBusinessName}_${pin}`;
    
    // Check if business name + PIN combination already exists
    const sessionFile = path.join(STORAGE_DIR, `${sessionKey}.json`);
    
    try {
      await fs.access(sessionFile);
      return NextResponse.json(
        { error: 'This business name and PIN combination is already in use. Please choose a different PIN.' },
        { status: 409 }
      );
    } catch {
      // File doesn't exist, which is what we want
    }

    // Create session data
    const sessionData = {
      id: sessionId,
      sessionId,
      businessName: normalizedBusinessName,
      displayBusinessName: businessName.trim(),
      pin,
      email: email || null,
      planData,
      shareableId: allowSharing ? shareableId : null,
      allowSharing,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    };

    // Save to file
    await fs.writeFile(sessionFile, JSON.stringify(sessionData, null, 2));

    // Also save by shareable ID if sharing is enabled
    if (allowSharing && shareableId) {
      const shareableFile = path.join(STORAGE_DIR, `share_${shareableId}.json`);
      await fs.writeFile(shareableFile, JSON.stringify({
        ...sessionData,
        isSharedAccess: true
      }, null, 2));
    }

    return NextResponse.json({
      success: true,
      shareableLink: allowSharing ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3004'}/shared/${shareableId}` : null
    });

  } catch (error) {
    console.error('Error saving anonymous session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 