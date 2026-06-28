import Favorite from '../models/Favorite.model.js';
import Recipe from '../models/Recipe.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ✅ Add to Favorites
export const addToFavorites = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return errorResponse(res, 'Recipe not found', 404);
    }

    // Check if already in favorites
    const existing = await Favorite.findOne({ userId, recipeId });
    if (existing) {
      return errorResponse(res, 'Recipe already in favorites', 400);
    }

    const favorite = new Favorite({
      userId,
      userEmail,
      recipeId,
    });

    await favorite.save();

    return successResponse(res, 'Recipe added to favorites', favorite);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Remove from Favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOneAndDelete({ userId, recipeId });
    if (!favorite) {
      return errorResponse(res, 'Recipe not found in favorites', 404);
    }

    return successResponse(res, 'Recipe removed from favorites');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get User's Favorites
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.find({ userId })
      .populate('recipeId')
      .sort({ addedAt: -1 });

    return successResponse(res, 'Favorites fetched successfully', favorites);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Check if Recipe is Favorite
export const checkFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOne({ userId, recipeId });

    return successResponse(res, 'Favorite status checked', {
      isFavorite: !!favorite,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};