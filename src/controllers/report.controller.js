import Report from '../models/Report.model.js';
import Recipe from '../models/Recipe.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ✅ Create Report
export const createReport = async (req, res) => {
  try {
    const { recipeId, reason, description } = req.body;
    const reporterEmail = req.user.email;

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return errorResponse(res, 'Recipe not found', 404);
    }

    // Check if already reported
    const existingReport = await Report.findOne({ 
      recipeId, 
      reporterEmail, 
      status: 'pending' 
    });
    
    if (existingReport) {
      return errorResponse(res, 'You have already reported this recipe', 400);
    }

    const report = new Report({
      recipeId,
      reporterEmail,
      reason,
      description,
      status: 'pending',
    });

    await report.save();

    return successResponse(res, 'Recipe reported successfully', report);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get All Reports (Admin only)
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({ status: 'pending' })
      .populate('recipeId')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Reports fetched successfully', reports);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Dismiss Report (Admin only)
export const dismissReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return errorResponse(res, 'Report not found', 404);
    }

    report.status = 'dismissed';
    await report.save();

    return successResponse(res, 'Report dismissed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Remove Recipe from Report (Admin only)
export const removeRecipeFromReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return errorResponse(res, 'Report not found', 404);
    }

    // Delete the recipe
    await Recipe.findByIdAndDelete(report.recipeId);

    // Update report status
    report.status = 'resolved';
    await report.save();

    return successResponse(res, 'Recipe removed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get Report Stats (Admin only)
export const getReportStats = async (req, res) => {
  try {
    const pending = await Report.countDocuments({ status: 'pending' });
    const dismissed = await Report.countDocuments({ status: 'dismissed' });
    const resolved = await Report.countDocuments({ status: 'resolved' });

    return successResponse(res, 'Report stats fetched', {
      pending,
      dismissed,
      resolved,
      total: pending + dismissed + resolved,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};