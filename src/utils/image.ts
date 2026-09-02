/**
 * Client-side image processing utility for MPLT ZERO.
 * Crops any uploaded image into a crisp 1:1 square, resizes to a target dimension (e.g., 256x256),
 * and compresses it to an optimized base64 Data URL (~15-30KB) for seamless localStorage persistence.
 */

export interface ProcessImageOptions {
  maxDimension?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
}

export const processAvatarImage = (
  file: File,
  options: ProcessImageOptions = {}
): Promise<string> => {
  const {
    maxDimension = 256,
    quality = 0.85,
    format = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    // Basic file size check (10MB maximum input)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('Image file is too large. Maximum size is 10MB.'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not initialize canvas context.'));
            return;
          }

          // Target output dimension
          canvas.width = maxDimension;
          canvas.height = maxDimension;

          // Enable high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Calculate center square crop
          const { width, height } = img;
          const minDim = Math.min(width, height);
          const startX = (width - minDim) / 2;
          const startY = (height - minDim) / 2;

          // Draw cropped & scaled square
          ctx.drawImage(
            img,
            startX,
            startY,
            minDim,
            minDim,
            0,
            0,
            maxDimension,
            maxDimension
          );

          // Try exporting to WebP first, fallback to JPEG if browser doesn't support WebP export
          let dataUrl = canvas.toDataURL(format, quality);
          if (format === 'image/webp' && !dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image file.'));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file from disk.'));
    };

    reader.readAsDataURL(file);
  });
};
