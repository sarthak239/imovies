const jwt = require('jsonwebtoken');

const generateToken = (userOrId) => {
  const payload = typeof userOrId === 'object' && userOrId !== null
    ? { id: userOrId._id || userOrId.id, email: userOrId.email, role: userOrId.role }
    : { id: userOrId };

  return jwt.sign(payload, process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_skillwallet_2026', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = generateToken;
