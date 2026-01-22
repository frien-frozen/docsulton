import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                // Authenticated users only?
                // const session = await getServerSession(authOptions);
                // if (!session) throw new Error('Unauthorized');

                // Allowed file types
                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif'],
                    tokenPayload: JSON.stringify({
                        // optional payload
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Callback after upload
                console.log('blob uploaded', blob.url);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 },
        );
    }
}
