import express from 'express';
import urlshortenerController from '../controllers/urlShortener';
import {xlValidate} from '../controllers/xlController'
import multer from "multer";

const upload = multer()

const router = express.Router();

router
    .route('/')
    .post(urlshortenerController.urlshortener)

router
    .route('/:shortCode')
    .get(urlshortenerController.getOriginalUrl)

router
    .route('/alias')
    .post(urlshortenerController.createAlias)

router
    .route('/bulk-create')
    .post(upload.single("file"), xlValidate, urlshortenerController.bulkCreate);

export default router;