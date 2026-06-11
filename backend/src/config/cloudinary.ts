import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Storage for plant disease images ────────────────────────────────────────
const diseaseStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'agroai/disease-scans',
    allowed_formats: ['jpg', 'jpeg', 'png', 'heic', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  } as any,
});

// ─── Storage for product images ───────────────────────────────────────────────
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'agroai/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 600, height: 600, crop: 'fill', quality: 'auto' }],
  } as any,
});

// ─── Storage for avatars ──────────────────────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'agroai/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
  } as any,
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const uploadDiseaseImage = multer({ storage: diseaseStorage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
export const uploadProductImages = multer({ storage: productStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadAvatar = multer({ storage: avatarStorage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

export { cloudinary };
