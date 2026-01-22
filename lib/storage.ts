import { upload } from '@vercel/blob/client';

/**
 * Compresses an image file to WebP format with resizing.
 */
async function compressImage(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) return file;

    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            const MAX_SIZE = 1920;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                        resolve(new File([blob], newName, { type: 'image/webp', lastModified: Date.now() }));
                    } else resolve(file);
                }, 'image/webp', 0.8);
            } else resolve(file);
        };
        img.onerror = () => resolve(file);
    });
}

/**
 * Uploads a file to Vercel Blob and returns the download URL.
 */
export async function uploadToFirebase(file: File, folder: string = 'uploads'): Promise<string> {
    try {
        const compressedFile = await compressImage(file);
        const filename = `${folder}/${compressedFile.name}`;

        const newBlob = await upload(filename, compressedFile, {
            access: 'public',
            handleUploadUrl: '/api/upload',
        });

        return newBlob.url;
    } catch (error: any) {
        console.error('Error uploading to Vercel Blob:', error);
        throw new Error(`Yuklashda xatolik: ${error.message}`);
    }
}
