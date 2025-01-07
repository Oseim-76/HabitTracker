import express from 'express';
import { auth as authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';
import path from 'path';

const router = express.Router();

// Simple upload endpoint
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
  try {
    console.log('Upload request:', {
      file: req.file ? 'Present' : 'Missing',
      userId: req.user?._id,
      contentType: req.headers['content-type']
    });

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      status: 'success',
      data: { profile_image: imageUrl }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Upload failed'
    });
  }
});

export default router; 