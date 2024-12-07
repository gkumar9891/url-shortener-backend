import express from 'express';
import downloadController from '../controllers/downloadController';
const router = express.Router();

router
    .route('/')
    .post(downloadController.downloadFile)

export default router;