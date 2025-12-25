import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        DATABASE_URL: process.env.DATABASE_URL ? 'SET (length: ' + process.env.DATABASE_URL.length + ')' : 'NOT SET',
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT SET',
        NODE_ENV: process.env.NODE_ENV,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('FIREBASE'))
    })
}
