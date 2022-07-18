const ErrorCode = {};

class AppError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.message = message || ErrorCode[code];
  }
}

module.exports = exports = AppError;

exports.setErrorCode = (ec) => {
  Object.keys(ec).forEach((key) => {
    if (key in ErrorCode) {
      throw new Error(
        `AppError :: error code exists for key <${key}> <${ErrorCode[key]}>`
      );
    }
    ErrorCode[key] = ec[key];
  });
};
