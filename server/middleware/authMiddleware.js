const jwt = require('jsonwebtoken');
const SECRET = "supersecret";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(authHeader, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.sendStatus(401);
  }
};