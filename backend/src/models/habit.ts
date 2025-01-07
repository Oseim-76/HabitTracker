import mongoose, { Schema, Document } from 'mongoose';

export interface IHabit extends Document {
  user_id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time_of_day?: string;
  scheduled_time?: string;
  completed_dates: string[];
  current_streak: number;
  longest_streak: number;
  created_at: Date;
  updated_at: Date;
}

const habitSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  description: { type: String },
  frequency: { 
    type: String, 
    required: true,
    enum: ['daily', 'weekly', 'monthly']
  },
  time_of_day: { type: String },
  scheduled_time: { type: String },
  completed_dates: [{ type: String }],
  current_streak: { type: Number, default: 0 },
  longest_streak: { type: Number, default: 0 }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Habit = mongoose.model<IHabit>('Habit', habitSchema);

export { Habit }; 