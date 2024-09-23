import express from 'express';
import urlshortenerController from '../controllers/urlshortener';
const router = express.Router();

router
    .route('/url-shortener')
    .post(urlshortenerController.urlshortener)

router
    .route('/url-shortener/:shortCode')
    .get(urlshortenerController.getOriginalUrl)

export default router;