const prisma = require('../utils/prisma');

const auditLog = (action, entity, getEntityId = null) => {
  return async (req, res, next) => {
    // Store original json method to intercept response
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      // Log the action after response is sent
      try {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          const entityId = getEntityId ? getEntityId(req, body) : (req.params.id || req.params.instanceId || null);
          await prisma.activityLog.create({
            data: {
              userId: req.user?.id,
              action: action,
              entity: entity,
              entityId: entityId || 'unknown',
              details: {
                method: req.method,
                path: req.originalUrl,
                body: sanitizeBody(req.body),
              },
            },
          });
        }
      } catch (err) {
        console.error('Audit log error:', err.message);
      }

      return originalJson(body);
    };

    next();
  };
};

// Sanitize sensitive fields from request body
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'refreshToken', 'secret', 'apiKey'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) sanitized[field] = '[REDACTED]';
  });
  return sanitized;
}

module.exports = { auditLog };
