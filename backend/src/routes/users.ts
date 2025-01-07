import multer from 'multer';
import express from 'express';
import { auth } from '../middleware/auth';

const router = express.Router();
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Add the profile image upload route
router.post('/profile-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
    }

    // Handle the image upload (store in DB or file system)
    // For now, just return success
    res.json({
      status: 'success',
      data: {
        profile_image: 'path/to/image' // Replace with actual image path
      }
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload profile image'
    });
  }
});

export default router; 