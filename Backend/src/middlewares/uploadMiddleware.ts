// src/middlewares/uploadMiddleware.ts - Updated with type assertion
import multer from 'multer';
import fs from 'fs';
import { Request } from 'express';

// Define the type for multerFilenames
interface MulterFileInfo {
  originalName: string;
  filename: string;
  timestamp: number;
}

// Extend the Request interface locally
declare global {
  namespace Express {
    interface Request {
      multerFilenames?: MulterFileInfo[];
    }
  }
}

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created uploads directory: ${uploadDir}`);
}

// Configure storage - Store with original filename
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    console.log('Multer saving file to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req: Request, file, cb) => {
    // Store with timestamp + original name to avoid conflicts
    const timestamp = Date.now();
    
    // Clean filename: replace spaces with underscores
    const safeOriginalName = file.originalname
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/[^\w.-]/gi, ''); // Remove special characters
    
    const uniqueFilename = `${timestamp}-${safeOriginalName}`;
    
    console.log('Multer filename:', {
      original: file.originalname,
      safe: safeOriginalName,
      unique: uniqueFilename
    });
    
    // Store the filename in the request for later use
    if (!req.multerFilenames) {
      req.multerFilenames = [];
    }
    req.multerFilenames.push({
      originalName: file.originalname,
      filename: uniqueFilename,
      timestamp: timestamp
    });
    
    cb(null, uniqueFilename);
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, PDFs, and archives are allowed.'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});