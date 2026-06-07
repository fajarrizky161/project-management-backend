const prisma = require('../utils/prisma');

const logActivity = (action, entity, getEntityId = null) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      try {
        if (req.user && body && body.success) {
          await prisma.activityLog.create({
            data: {
              userId: req.user.id,
              action,
              entity,
              entityId: getEntityId ? getEntityId(req) : (req.params.id || req.params.instanceId || 'unknown'),
              details: {
                method: req.method,
                path: req.path,
                body: req.body ? { ...req.body, password: undefined, newPassword: undefined, currentPassword: undefined } : null
              }
            }
          });
        }
      } catch (err) {
        console.error('Activity log error:', err.message);
      }

      return originalJson(body);
    };

    next();
  };
};

module.exports = { logActivity };
