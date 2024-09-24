import express from 'express';
import urlshortenerController from '../controllers/urlShortener';
const router = express.Router();

router
    .route('/url-shortener')
    .post(urlshortenerController.urlshortener)

router
    .route('/url-shortener/:shortCode')
    .get(urlshortenerController.getOriginalUrl)

export default router;