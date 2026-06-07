const ApiResponse = require('../utils/apiResponse');

const checkPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return ApiResponse.error(res, 'Forbidden: No role assigned', 403);
    }

    const userPermissions = req.user.role.permissions.map(p => p.name);
    const hasPermission = requiredPermissions.every(p => userPermissions.includes(p));

    if (!hasPermission) {
      return ApiResponse.error(res, 'Forbidden: Insufficient permissions', 403);
    }

    next();
  };
};

module.exports = { checkPermission };
