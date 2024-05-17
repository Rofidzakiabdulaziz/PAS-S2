const jwt = require('jsonwebtoken');

async function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  jwt.verify(token, 'bazmaSecretKey', function (err, decoded) {
    if (err) {
      return res.status(401).json({
        message: "Invalid Token, Unauthorized"
      })
    }
    req.user = decoded;
    return next();
  })
}

module.exports = verifyToken;
