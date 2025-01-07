import express from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads/profiles');
fs.mkdirSync(uploadDir, { recursive: true });

// Profile image upload endpoint
router.post('/profile-image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    console.log('Upload request:', {
      userId: req.user?.id,
      file: req.file ? 'Present' : 'Missing',
      contentType: req.headers['content-type']
    });

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    // Create relative URL for the uploaded file
    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    // Update user's profile image in database
    await prisma.user.update({
      where: { id: req.user.id },
      data: { profile_image: imageUrl }
    });

    res.json({
      status: 'success',
      data: { profile_image: imageUrl }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload image'
    });
  }
});

export default router; 