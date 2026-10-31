const { validationResult } = require('express-validator');

// Runs after express-validator chains; rejects the request with the first problem per field.
function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array({ onlyFirstError: true }).map((e) => ({ field: e.path, message: e.msg }));
  return res.status(400).json({ error: errors[0].message, errors });
}

module.exports = validate;
