import express from 'express';
import * as urlShortnerController from '../controllers/urlShortner';
const router = express.Router();

router
    .route('/url-shortner')
    .post(urlShortnerController.urlShortner)

export default router;