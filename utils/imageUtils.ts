/**
 * Modifies the JPEG header to set the DPI (Dots Per Inch).
 * This is crucial for print-ready exports.
 */
export const setDpi = (base64Image: string, dpi: number): string => {
    // Remove header if present to get raw bytes
    const byteString = atob(base64Image.split(',')[1]);
    const buffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(buffer);
    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    // Verify it's a JPEG (SOI marker FF D8)
    if (uint8Array[0] !== 0xFF || uint8Array[1] !== 0xD8) return base64Image;

    let offset = 2;
    while (offset < uint8Array.length) {
        // Look for APP0 marker (FF E0)
        if (uint8Array[offset] === 0xFF && uint8Array[offset+1] === 0xE0) {
            // Check for JFIF identifier
            if (uint8Array[offset+4] === 0x4A && 
                uint8Array[offset+5] === 0x46 && 
                uint8Array[offset+6] === 0x49 && 
                uint8Array[offset+7] === 0x46 && 
                uint8Array[offset+8] === 0x00) {
                
                uint8Array[offset+11] = 1; // Units: dots per inch
                uint8Array[offset+12] = (dpi >> 8) & 0xFF;
                uint8Array[offset+13] = dpi & 0xFF;
                uint8Array[offset+14] = (dpi >> 8) & 0xFF;
                uint8Array[offset+15] = dpi & 0xFF;
                break;
            }
        }
        // Start of Scan (SOS) - stop looking
        if (uint8Array[offset] === 0xFF && uint8Array[offset+1] === 0xDA) break;
        offset++;
    }
    
    // Reconstruct base64 string
    let binary = '';
    const len = uint8Array.byteLength;
    // Chunking to avoid stack overflow with large images
    for (let i = 0; i < len; i += 32768) {
        binary += String.fromCharCode.apply(null, Array.from(uint8Array.subarray(i, Math.min(i + 32768, len))));
    }
    return 'data:image/jpeg;base64,' + btoa(binary);
};

/**
 * Resizes image to 3000px width and sets 300 DPI for high-quality export.
 */
export const processImageForExport = (imgSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Target width 3000px for better 300DPI quality
            const targetWidth = 3000;
            const scaleFactor = targetWidth / img.width;
            const targetHeight = img.height * scaleFactor;

            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            // Fill white background (transparency safety)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            
            // Export at 1.0 (Max Quality)
            const resizedBase64 = canvas.toDataURL('image/jpeg', 1.0);
            const finalBase64 = setDpi(resizedBase64, 300);
            resolve(finalBase64);
        };
        img.onerror = (err) => reject(err);
        img.src = imgSrc;
    });
};