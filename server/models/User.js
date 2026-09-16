import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: 'Listener',
    },
    interests: {
      type: [String],
      default: ['AI & Tech', 'Markets', 'Startup'],
    },
    voicePreference: {
      type: String,
      default: 'Aria',
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
