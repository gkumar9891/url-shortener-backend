import { Request, Response, NextFunction as Next } from "express";
import AppError from "../utils/appError";

import type {MulterRequest} from '../controllers/urlShortener';


export function xlValidate(req: MulterRequest, res: Response, next: Next) {
    if(!req.file) {
        return next(AppError.create(`No file Uploaded`,400))
    }

    next();
}