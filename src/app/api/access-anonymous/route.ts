import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Simple file-based storage for anonymous sessions
const STORAGE_DIR = path.join(process.cwd(), 'data', 'anonymous-sessions');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, pin } = body;

    // Validate required fields
    if (!businessName || !pin) {
      return NextResponse.json(
        { error: 'Business name and PIN are required' },
        { status: 400 }
      );
    }

    const normalizedBusinessName = businessName.toLowerCase().trim();
    const sessionKey = `${normalizedBusinessName}_${pin}`;
    const sessionFile = path.join(STORAGE_DIR, `${sessionKey}.json`);

    // Find the session file
    let sessionData;
    try {
      const fileContent = await fs.readFile(sessionFile, 'utf-8');
      sessionData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { error: 'No plan found with those credentials' },
        { status: 404 }
      );
    }

    // Update last accessed time
    sessionData.lastAccessed = new Date().toISOString();
    await fs.writeFile(sessionFile, JSON.stringify(sessionData, null, 2));

    // Return the plan data
    return NextResponse.json({
      success: true,
      planData: sessionData.planData,
      shareableLink: sessionData.shareableId ? 
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3004'}/shared/${sessionData.shareableId}` : 
        null,
      businessName: sessionData.displayBusinessName
    });

  } catch (error) {
    console.error('Error accessing anonymous session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 