class AppError extends Error {

  public statusCode;
  public status;
  public isOperational;

  constructor(message:any, statusCode:any) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
