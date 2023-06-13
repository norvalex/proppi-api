module.exports = function admin(req, res, next) {
  // isAdmin, if available is included as part of the toke, therefore should already be on req.user
  if (!req.user.isAdmin) return res.status(403).send("Access denied.");
  next();
};
