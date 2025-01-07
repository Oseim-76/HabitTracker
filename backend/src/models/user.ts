import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  username: string;
  profile_image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  profile_image: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema); 