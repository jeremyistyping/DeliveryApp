import multer from 'multer';
import path from 'path';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Accept Excel files only
  const allowedExtensions = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xlsx, .xls) and CSV files are allowed'), false);
  }
};

export const uploadExcel = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});
