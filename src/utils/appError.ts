class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;

    private constructor(message:string, statusCode:number) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }

    public static create(message:string, statusCode:number) {
        return new AppError(message, statusCode);
    }
}

export default AppError;
