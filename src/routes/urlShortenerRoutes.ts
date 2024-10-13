import express from 'express';
import urlshortenerController from '../controllers/urlShortener';
const router = express.Router();

router
    .route('/')
    .post(urlshortenerController.urlshortener)

router
    .route('/:shortCode')
    .get(urlshortenerController.getOriginalUrl)

export default router;