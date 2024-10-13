import { createHmac } from "crypto";
import Url, { UrlModel } from "../models/Url";
import { Request, Response, NextFunction as Next, NextFunction } from "express";
import catchAsync from '../utils/catchAsync';
import AppError from "../utils/appError";

const urlshortener = catchAsync(async (req, res, next) => {
    const validURL = (str: string) => {
        const pattern: RegExp = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return !!pattern.test(str);
    }

    if (!req.body.url) {
        return res.status(400).send(`url is required`)
    } else if (!validURL(req.body.url)) {
        return res.status(400).send(`url is not valid`)
    }

    const secret: string = process.env.APP_SECRET! as string;
    const encryptionAlgo: string = process.env.APP_ENCRYPTION_ALGO! as string;
    const appShortUrlLimit: string = process.env.APP_IDEAL_SHORT_URL_LIMIT! as string;

    const [from, to]: [string, string] = appShortUrlLimit.split('_') as [string, string];

    //to create unique short url;
    let tempUrl: string = req.body.url;
    const number: number = Math.random() * 10000;
    tempUrl = tempUrl + btoa(number + '') + new Date().toTimeString();

    const hash: string = createHmac(encryptionAlgo, secret)
        .update(tempUrl)
        .digest('hex')
        .slice(parseInt(from), parseInt(to));

    const urlRegex = /^(https?:\/\/)/;

    if (!urlRegex.test(req.body.url)) {
        req.body.url = `https://${req.body.url}`
    }

    const url = await Url.create({
        short_url: hash,
        original_url: req.body.url
    });

    res.send(url.toJSON())
})


const getOriginalUrl = catchAsync(async (req: Request, res: Response, next: Next) => {
    const url: UrlModel | null = await Url.findOne({ where: { short_url: req.params.shortCode } }) as UrlModel | null;

    if (url) {
        return res.status(200).json(url.toJSON());
    }

    next(AppError.create(`not-found`, 404));
})

const createAlias = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { shortCode, url } = req.body;

    if (!shortCode || !url) {
        next(AppError.create(`plese pass short code and url`, 400));
    }

    let shortUrlLimit = process.env.APP_IDEAL_SHORT_URL_LIMIT! as string;

    let limit = shortUrlLimit.split('_');

    let shortCodelength = parseInt(limit[1]) - parseInt(limit[0]);

    if (shortCode.length < shortCodelength) {
        return next(AppError.create(`shortCode length should be atleast ${shortCodelength}`, 400));
    }

    try {
        const _url = await Url.create({
            short_url: shortCode,
            original_url: url
        })

        res.status(201).json(_url.toJSON());
    } catch (err: any) {
        if (err.original.code == "ER_DUP_ENTRY") {
            return next(AppError.create(`pass another unique short code`, 400));
        }

        next(err);
    }
});


export default { urlshortener, getOriginalUrl, createAlias }