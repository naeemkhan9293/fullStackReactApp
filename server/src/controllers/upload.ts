import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Service from '../models/Service';
import fs from 'fs';
import path from 'path';
import cloudinary from '../config/cloudinary';

// @desc    Upload avatar
// @route   POST /api/upload/avatar
// @access  Private
export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file',
      });
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: 'avatars',
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' }
      ]
    });

    // Delete the temporary file
    fs.unlinkSync(req.file.path);

    // Update user's avatar in the database
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { avatar: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        avatar: uploadResponse.secure_url,
        user
      }
    });
  } catch (err) {
    console.error('Avatar upload error:', err);
    // If there's a file, delete it on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting file:', unlinkErr);
      }
    }
    next(err);
  }
};

// @desc    Upload service image
// @route   POST /api/upload/service
// @access  Private (Provider only)
export const uploadServiceImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file',
      });
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: 'services',
      transformation: [
        { width: 800, height: 600, crop: 'fill' }
      ]
    });

    // Delete the temporary file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      data: {
        imageUrl: uploadResponse.secure_url,
        publicId: uploadResponse.public_id
      }
    });
  } catch (err) {
    console.error('Service image upload error:', err);
    // If there's a file, delete it on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting file:', unlinkErr);
      }
    }
    next(err);
  }
};
