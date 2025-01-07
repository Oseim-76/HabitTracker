import express, { Request, Response } from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth';
import { User, IUser } from '../models/user';

const router = express.Router();

interface AuthenticatedRequest extends Request {
  user: IUser;
  file?: Express.Multer.File;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}`);
  }
});

const upload = multer({ storage });

const handleProfileImage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No image file provided' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profile_image: req.file.path },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        profile_image: user.profile_image
      }
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload profile image'
    });
  }
};

router.post('/profile-image', 
  auth as any,
  upload.single('image'), 
  handleProfileImage as express.RequestHandler
);

export default router; 