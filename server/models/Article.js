import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    headline: { type: String, required: true },
    summary: String,
    source: String,
    category: { type: String, required: true },
    url: String,
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Article', articleSchema);
