import { validationResult } from "express-validator";
import { AppError } from "./errorHandler.js";

// Run after express-validator chains; rejects the request with the first message
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  next();
};

export default validate;
