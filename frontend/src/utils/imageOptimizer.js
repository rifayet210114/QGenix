/**
 * imageOptimizer.js — High-performance Client-side Avatar Compressor
 * ------------------------------------------------------------------
 * Accepts any image format (PNG, JPG, WEBP, AVIF, GIF, etc.),
 * performs center-crop square scaling (max 280x280px),
 * and compresses down to an ultra-lightweight WebP/JPEG data URL (~15-35KB).
 * Zero extra load on server and instant realtime previews!
 */

export const optimizeAvatarImage = (file, maxDimension = 280, quality = 0.84) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }

    // Basic format check
    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|avif|gif|bmp|svg)$/i)) {
      return reject(new Error('Please select a valid image file (JPG, PNG, WebP, AVIF, GIF, etc.)'));
    }

    const originalSizeKB = (file.size / 1024).toFixed(1);

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.onload = () => {
        // Calculate center-crop square
        const minSide = Math.min(img.naturalWidth, img.naturalHeight);
        const cropX = (img.naturalWidth - minSide) / 2;
        const cropY = (img.naturalHeight - minSide) / 2;

        const targetSize = Math.min(maxDimension, minSide);

        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw cropped & scaled square
        ctx.drawImage(
          img,
          cropX, cropY, minSide, minSide,
          0, 0, targetSize, targetSize
        );

        // Try WebP first, fallback to JPEG
        let dataUrl = '';
        try {
          dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        } catch (err) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Calculate compressed size in KB from base64 length
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const compressedBytes = (base64Length * 3) / 4;
        const compressedSizeKB = (compressedBytes / 1024).toFixed(1);
        const reductionPercent = Math.max(0, Math.round((1 - (compressedBytes / file.size)) * 100));

        resolve({
          dataUrl,
          originalSizeKB,
          compressedSizeKB,
          reductionPercent,
          format: dataUrl.split(';')[0].replace('data:image/', '').toUpperCase()
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
