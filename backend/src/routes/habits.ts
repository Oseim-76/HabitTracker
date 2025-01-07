import express, { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { habitsController } from '../controllers/habitsController';
import { Habit } from '../models/habit';
import mongoose from 'mongoose';

const router = express.Router();

// All routes are protected
router.use(auth);

// Get all habits
router.get('/', async (req: Request, res: Response) => {
  try {
    const habits = await habitsController.getHabits(req.user!._id);
    res.json({
      status: 'success',
      data: habits
    });
  } catch (error) {
    console.error('Error getting habits:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get habits'
    });
  }
});

// Create habit
router.post('/', async (req, res) => {
  try {
    const habit = await habitsController.createHabit(req.user!._id, req.body);
    res.json({
      status: 'success',
      data: habit
    });
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create habit'
    });
  }
});

// Toggle habit completion
router.post('/:id/toggle', async (req, res) => {
  try {
    const habit = await habitsController.toggleHabit(req.params.id, req.body.date);
    res.json({
      status: 'success',
      data: habit
    });
  } catch (error) {
    console.error('Error toggling habit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle habit'
    });
  }
});

// Update habit
router.patch('/:id', async (req, res) => {
  try {
    const habitId = req.params.id;
    if (!habitId) {
      return res.status(400).json({
        status: 'error',
        message: 'Habit ID is required'
      });
    }

    const habit = await habitsController.updateHabit(habitId, req.body);
    if (!habit) {
      return res.status(404).json({
        status: 'error',
        message: 'Habit not found'
      });
    }

    res.json({
      status: 'success',
      data: habit
    });
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update habit'
    });
  }
});

// Delete habit
router.delete('/:id', async (req, res) => {
  const habitId = req.params.id;
  console.log('Delete request received for habit:', { 
    habitId,
    isValidId: mongoose.isValidObjectId(habitId),
    userId: req.user?._id 
  });
  
  if (!habitId || !mongoose.isValidObjectId(habitId)) {
    console.log('Invalid habit ID format:', habitId);
    return res.status(400).json({
      status: 'error',
      message: 'Invalid habit ID format'
    });
  }

  try {
    // Check if habit belongs to current user
    const habit = await Habit.findOne({ 
      _id: habitId,
      user_id: req.user!._id 
    });

    if (!habit) {
      return res.status(404).json({
        status: 'error',
        message: 'Habit not found or unauthorized'
      });
    }

    // Safe delete
    await Habit.deleteOne({ _id: habitId });
    
    res.json({
      status: 'success',
      message: 'Habit deleted successfully'
    });

  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Could not delete habit'
    });
  }
});

export default router; 