// src/utils/imageUploader.ts

import multer from 'multer';

const storage = multer.memoryStorage(); // Store image in memory as buffer

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max size
  },
});

export const uploadSingleImage = upload.single('file'); // 'profilePic' must match your form field name
