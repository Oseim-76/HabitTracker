import express from 'express';
import { auth } from '../middleware/auth';
import { authController } from '../controllers/authController';
import { upload } from '../middleware/upload';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/verify', auth, authController.verify);

// Add upload endpoint to auth routes
router.post('/upload', auth, upload.single('image'), (req, res) => {
  try {
    // Log the entire request for debugging
    console.log('Upload request details:', {
      body: req.body,
      file: req.file ? {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file'
    });

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    
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