import express from 'express';
import {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  likeRecipe,
  featureRecipe,
  getFeaturedRecipes,
  getPopularRecipes,
  getUserRecipes,
  getRecipesByCategory,
  getCategories,
} from '../controllers/recipe.controller.js';
import { verifyTokenMiddleware } from '../middlewares/verifyToken.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllRecipes);
router.get('/featured', getFeaturedRecipes);
router.get('/popular', getPopularRecipes);
router.get('/categories', getCategories);
router.get('/category/:category', getRecipesByCategory);
router.get('/:id', getRecipeById);

// Protected routes (User)
router.post('/', verifyTokenMiddleware, uploadSingle, createRecipe);
router.put('/:id', verifyTokenMiddleware, uploadSingle, updateRecipe);
router.delete('/:id', verifyTokenMiddleware, deleteRecipe);
router.patch('/:id/like', verifyTokenMiddleware, likeRecipe);
router.get('/user/my-recipes', verifyTokenMiddleware, getUserRecipes);

// Admin only routes
router.patch('/:id/feature', verifyTokenMiddleware, verifyAdmin, featureRecipe);

export default router;