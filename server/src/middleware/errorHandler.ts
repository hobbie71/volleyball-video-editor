import { AppError } from "../types/AppError.js";
import type { ErrorResponse } from "@shared/types/errorResponse.types.js";

export const errorHandler = (error?: AppError): ErrorResponse => {
  if (!error) {
    error = new AppError("An unknown error occurred.", 500);
  }

  console.error(`
    [Error]: ${error.message}
    [Status Code]: ${error.statusCode}
    `);

  const errorResponse: ErrorResponse = {
    message: error.message || "An unknown error occurred.",
    statusCode: error.statusCode || 500,
  };

  return errorResponse;
};
