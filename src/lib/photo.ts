const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const MAX_SOURCE_PIXELS = 50_000_000;
const MAX_UPLOAD_BYTES = 1_950_000;
const MAIN_LONG_EDGE = 1920;
const THUMB_LONG_EDGE = 360;

export interface PreparedPhoto {
  main: Blob;
  thumbnail: Blob;
  width: number;
  height: number;
}

interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('未能轉換相片格式。'))),
      'image/jpeg',
      quality,
    );
  });
}

async function decodePhoto(file: File): Promise<DecodedImage> {
  if ('createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      };
    } catch {
      // Some mobile browsers expose createImageBitmap but cannot decode HEIC.
      // The HTMLImageElement fallback may still support the phone's format.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = objectUrl;
    await image.decode();
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      close: () => URL.revokeObjectURL(objectUrl),
    };
  } catch {
    URL.revokeObjectURL(objectUrl);
    throw new Error('呢個相片格式暫時未能處理，請改用 JPEG、PNG 或 WebP。');
  }
}

function dimensions(width: number, height: number, longEdge: number) {
  const scale = Math.min(1, longEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function draw(source: CanvasImageSource, width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('瀏覽器未能處理相片。');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

async function encodeWithinLimit(
  source: CanvasImageSource,
  originalWidth: number,
  originalHeight: number,
) {
  let target = dimensions(originalWidth, originalHeight, MAIN_LONG_EDGE);
  let canvas = draw(source, target.width, target.height);
  const qualities = [0.82, 0.74, 0.66, 0.58];

  for (let scalePass = 0; scalePass < 3; scalePass += 1) {
    for (const quality of qualities) {
      const blob = await canvasBlob(canvas, quality);
      if (blob.size <= MAX_UPLOAD_BYTES) {
        return { blob, width: canvas.width, height: canvas.height };
      }
    }
    target = {
      width: Math.max(1, Math.round(canvas.width * 0.82)),
      height: Math.max(1, Math.round(canvas.height * 0.82)),
    };
    canvas.width = 0;
    canvas.height = 0;
    canvas = draw(source, target.width, target.height);
  }

  canvas.width = 0;
  canvas.height = 0;
  throw new Error('相片壓縮後仍然太大，請選擇另一張相。');
}

export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  if (!file.type.startsWith('image/')) throw new Error('請選擇相片檔案。');
  if (file.size > MAX_SOURCE_BYTES) throw new Error('原相片大過 25 MB，請先縮細再上傳。');

  const decoded = await decodePhoto(file);
  try {
    if (!decoded.width || !decoded.height || decoded.width * decoded.height > MAX_SOURCE_PIXELS) {
      throw new Error('相片解像度太高，請先縮細再上傳。');
    }

    const main = await encodeWithinLimit(decoded.source, decoded.width, decoded.height);
    const thumbSize = dimensions(decoded.width, decoded.height, THUMB_LONG_EDGE);
    const thumbCanvas = draw(decoded.source, thumbSize.width, thumbSize.height);
    const thumbnail = await canvasBlob(thumbCanvas, 0.72);
    thumbCanvas.width = 0;
    thumbCanvas.height = 0;

    return {
      main: main.blob,
      thumbnail,
      width: main.width,
      height: main.height,
    };
  } finally {
    decoded.close();
  }
}

export function makePhotoId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
