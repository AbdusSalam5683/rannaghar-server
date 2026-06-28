import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema(
  {
    recipeName: {
      type: String,
      required: [true, 'Recipe name is required'],
      trim: true,
    },
    recipeImage: {
      type: String,
      required: [true, 'Recipe image is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    cuisineType: {
      type: String,
      required: [true, 'Cuisine type is required'],
      trim: true,
    },
    difficultyLevel: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: [true, 'Difficulty level is required'],
    },
    preparationTime: {
      type: String,
      required: [true, 'Preparation time is required'],
    },
    ingredients: {
      type: [String],
      required: [true, 'Ingredients are required'],
    },
    instructions: {
      type: [String],
      required: [true, 'Instructions are required'],
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorEmail: {
      type: String,
      required: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'reported', 'removed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;