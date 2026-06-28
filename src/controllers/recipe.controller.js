import Recipe from '../models/Recipe.model.js';
import Favorite from '../models/Favorite.model.js';
import User from '../models/User.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { uploadToImgbb } from '../utils/uploadToImgbb.js';

// ✅ Create Recipe
export const createRecipe = async (req, res) => {
  try {
    const {
      recipeName,
      category,
      cuisineType,
      difficultyLevel,
      preparationTime,
      ingredients,
      instructions,
    } = req.body;

    // Check if user is premium or has less than 2 recipes
    const user = await User.findById(req.user.id);
    const recipeCount = await Recipe.countDocuments({ authorId: req.user.id });

    if (!user.isPremium && recipeCount >= 2) {
      return errorResponse(
        res,
        'You have reached the limit of 2 recipes. Please upgrade to premium for unlimited recipes.',
        403
      );
    }

    // Handle image upload
    let recipeImage = '';
    if (req.file) {
      recipeImage = await uploadToImgbb(req.file.buffer, req.file.originalname);
    } else {
      return errorResponse(res, 'Recipe image is required', 400);
    }

    const recipe = new Recipe({
      recipeName,
      recipeImage,
      category,
      cuisineType,
      difficultyLevel,
      preparationTime,
      ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim()),
      instructions: Array.isArray(instructions) ? instructions : instructions.split(',').map(i => i.trim()),
      authorId: req.user.id,
      authorName: req.user.name,
      authorEmail: req.user.email,
      likesCount: 0,
      isFeatured: false,
      status: 'active',
    });

    await recipe.save();

    return successResponse(res, 'Recipe created successfully', recipe, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get All Recipes (with pagination & filtering)
export const getAllRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;

    const filter = { status: 'active' };
    if (category) {
      filter.category = { $in: [category] };
    }

    const recipes = await Recipe.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'name email image');

    const total = await Recipe.countDocuments(filter);

    return successResponse(res, 'Recipes fetched successfully', {
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get Single Recipe
export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id).populate('authorId', 'name email image');

    if (!recipe) {
      return errorResponse(res, 'Recipe not found', 404);
    }

    return successResponse(res, 'Recipe fetched successfully', recipe);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Update Recipe
export const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      recipeName,
      category,
      cuisineType,
      difficultyLevel,
      preparationTime,
      ingredients,
      instructions,
    } = req.body;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return errorResponse(res, 'Recipe not found', 404);
    }

    // Check if user is the author
    if (recipe.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'You are not authorized to update this recipe', 403);
    }

    // Handle image upload if new image provided
    let recipeImage = recipe.recipeImage;
    if (req.file) {
      recipeImage = await uploadToImgbb(req.file.buffer, req.file.originalname);
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      {
        recipeName: recipeName || recipe.recipeName,
        recipeImage,
        category: category || recipe.category,
        cuisineType: cuisineType || recipe.cuisineType,
        difficultyLevel: difficultyLevel || recipe.difficultyLevel,
        preparationTime: preparationTime || recipe.preparationTime,
        ingredients: ingredients ? (Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim())) : recipe.ingredients,
        instructions: instructions ? (Array.isArray(instructions) ? instructions : instructions.split(',').map(i => i.trim())) : recipe.instructions,
      },
      { new: true }
    );

    return successResponse(res, 'Recipe updated successfully', updatedRecipe);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Delete Recipe
export const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return errorResponse(res, 'Recipe not found', 404);
    }

    // Check if user is the author or admin
    if (recipe.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'You are not authorized to delete this recipe', 403);
    }

    await Recipe.findByIdAndDelete(id);

    // Also delete from favorites
    await Favorite.deleteMany({ recipeId: id });

    return successResponse(res, 'Recipe deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Like Recipe
export const likeRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return errorResponse(res, 'Recipe not found', 404);
    }

    recipe.likesCount += 1;
    await recipe.save();

    return successResponse(res, 'Recipe liked successfully', {
      likesCount: recipe.likesCount,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Feature Recipe (Admin only)
export const featureRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return errorResponse(res, 'Recipe not found', 404);
    }

    recipe.isFeatured = !recipe.isFeatured;
    await recipe.save();

    return successResponse(res, `Recipe ${recipe.isFeatured ? 'featured' : 'unfeatured'} successfully`, recipe);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get Featured Recipes
export const getFeaturedRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ isFeatured: true, status: 'active' })
      .limit(6)
      .populate('authorId', 'name email image');

    return successResponse(res, 'Featured recipes fetched successfully', recipes);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get Popular Recipes (most liked)
export const getPopularRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ status: 'active' })
      .sort({ likesCount: -1 })
      .limit(6)
      .populate('authorId', 'name email image');

    return successResponse(res, 'Popular recipes fetched successfully', recipes);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get User's Recipes
export const getUserRecipes = async (req, res) => {
  try {
    const userId = req.user.id;
    const recipes = await Recipe.find({ authorId: userId })
      .sort({ createdAt: -1 });

    return successResponse(res, 'User recipes fetched successfully', recipes);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get Recipes by Category
export const getRecipesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const recipes = await Recipe.find({ 
      category: { $in: [category] }, 
      status: 'active' 
    }).populate('authorId', 'name email image');

    return successResponse(res, 'Recipes by category fetched successfully', recipes);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get Recipe Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Recipe.distinct('category');
    return successResponse(res, 'Categories fetched successfully', categories);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};