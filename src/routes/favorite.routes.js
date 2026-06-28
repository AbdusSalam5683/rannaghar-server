import express from 'express';
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite,
} from '../controllers/favorite.controller.js';
import { verifyTokenMiddleware } from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyTokenMiddleware); // All routes are protected

router.post('/', addToFavorites);
router.delete('/:recipeId', removeFromFavorites);
router.get('/', getFavorites);
router.get('/check/:recipeId', checkFavorite);

export default router;