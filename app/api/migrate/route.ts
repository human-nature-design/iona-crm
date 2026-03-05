import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Security: Verify the request is from Vercel Deploy Hook
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.DEPLOY_HOOK_SECRET;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run migrations
    console.log('🚀 Running production migrations...');

    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const { stdout, stderr } = await execAsync('pnpm db:migrate');
    
    if (stderr) {
      console.error('Migration stderr:', stderr);
    }
    
    console.log('Migration output:', stdout);
    console.log('✅ Migrations completed successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migrations completed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 