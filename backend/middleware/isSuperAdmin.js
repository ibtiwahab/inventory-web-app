module.exports = function (req, res, next) {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ msg: 'Only Super Admins can perform this action' });
  }
  next();
};
