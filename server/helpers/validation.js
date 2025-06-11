const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().max(50).required(),
  lastName: Joi.string().max(50).required(),
  email: Joi.string().email().required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const uuidParamSchema = Joi.string().guid({ version: ['uuidv4'] }).required();


function validateRegister(payload) {
  return registerSchema.validate(payload, { abortEarly: false });
}

function validateLogin(payload) {
  return loginSchema.validate(payload, { abortEarly: false });
}


function validateUUID(id) {
  return uuidParamSchema.validate(id);
}

module.exports = {
  validateRegister,
  validateLogin,
  validateUUID,
};
