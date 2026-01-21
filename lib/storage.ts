import { storage } from './firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param file The file to upload
 * @param folder The folder path in storage (default: 'uploads')
 * @returns Promise resolving to the public download URL
 */
export async function uploadToFirebase(file: File, folder: string = 'uploads'): Promise<string> {
    try {
        // Create a unique filename
        const timestamp = Date.now()
        // Sanitise filename
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
        const fullPath = `${folder}/${timestamp}-${safeName}`

        const storageRef = ref(storage, fullPath)

        // Upload
        const snapshot = await uploadBytes(storageRef, file)

        // Get URL
        const url = await getDownloadURL(snapshot.ref)
        return url
    } catch (error) {
        console.error('Error uploading to Firebase:', error)
        throw error
    }
}
