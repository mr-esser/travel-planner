class ValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ValidationError';
    this.statusMessage = message;
    this.statusCode = code;
  }
}

module.exports = {
  ValidationError: ValidationError,
};
