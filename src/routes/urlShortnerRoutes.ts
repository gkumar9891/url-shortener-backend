import express from 'express';
import urlShortnerController from '../controllers/urlShortner';
const router = express.Router();

router
    .route('/url-shortner')
    .post(urlShortnerController.urlShortner)

router
    .route('/url-shortner/:shortCode')
    .get(urlShortnerController.getOriginalUrl)

export default router;