import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Simple file-based storage for anonymous sessions
const STORAGE_DIR = path.join(process.cwd(), 'data', 'anonymous-sessions');

interface RouteParams {
  params: {
    shareId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { shareId } = params;

    console.log('Shared link access attempt:', { shareId });

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    // Find the shared session file
    const shareableFile = path.join(STORAGE_DIR, `share_${shareId}.json`);
    
    console.log('Looking for shared file:', shareableFile);
    
    let sessionData;
    try {
      const fileContent = await fs.readFile(shareableFile, 'utf-8');
      sessionData = JSON.parse(fileContent);
      console.log('Found shared plan:', { businessName: sessionData.displayBusinessName });
    } catch (error) {
      console.error('Shared plan file not found:', shareableFile, error);
      
      // List all files in the directory for debugging
      try {
        const files = await fs.readdir(STORAGE_DIR);
        console.log('Available files in storage:', files);
      } catch (dirError) {
        console.error('Could not read storage directory:', dirError);
      }
      
      return NextResponse.json(
        { error: 'Shared plan not found or has expired' },
        { status: 404 }
      );
    }

    // Check if sharing is allowed
    if (!sessionData.allowSharing) {
      return NextResponse.json(
        { error: 'This plan is not available for sharing' },
        { status: 403 }
      );
    }

    // Return the plan data for read-only viewing
    return NextResponse.json({
      businessName: sessionData.displayBusinessName,
      planData: sessionData.planData,
      createdAt: sessionData.createdAt
    });

  } catch (error) {
    console.error('Error accessing shared plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 