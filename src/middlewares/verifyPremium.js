export const verifyPremium = (req, res, next) => {
  if (!req.user?.isPremium) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Premium membership required',
    });
  }
  next();
};