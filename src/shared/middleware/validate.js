const { ZodSchema } = require('zod');
const ApiResponse = require('../utils/apiResponse');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      const errors = error.errors?.map(e => ({ field: e.path.join('.'), message: e.message }));
      return ApiResponse.error(res, 'Validation Error', 400, errors);
    }
  };
};

module.exports = { validate };
