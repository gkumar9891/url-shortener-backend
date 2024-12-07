import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import path from 'path';
import fs from 'fs';
import AppError from '../utils/appError';


const downloadFile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { filePath: filename } = req.body;
    const filePath = path.join(__dirname, '../..', filename);
  
    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return next( AppError.create('File not found', 404))
      }
  
      // Send the file as a response for download
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error(err);
          next( AppError.create('Error downloading file',500));
        }
      });
    });
})

export default {downloadFile}