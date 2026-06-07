const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const ApiResponse = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Unauthorized: No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: { include: { permissions: true } } }
    });

    if (!user || user.status !== 'ACTIVE') {
      return ApiResponse.error(res, 'Unauthorized: User not found or inactive', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Unauthorized: Invalid token', 401);
  }
};

module.exports = { authenticate };
