import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    reporterEmail: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      enum: ['Spam', 'Offensive Content', 'Copyright Issue', 'Other'],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'dismissed', 'resolved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;