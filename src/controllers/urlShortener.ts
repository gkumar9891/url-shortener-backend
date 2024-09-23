import { createHmac } from "crypto";
import Url, { UrlModel } from "../models/Url";
import path from "path";
import { Request, Response, NextFunction as Next } from "express";

const urlshortener = async (req: Request, res: Response, next: Next) => {
    try {
        const validURL: Function = (str: string) => {
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

        const url = await Url.create({
            short_url: hash,
            original_url: req.body.url
        });

        res.send(url.toJSON())
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: 'internal server error'
        })
    }
}

const getOriginalUrl = async (req: Request, res: Response, next: Next) => {
    try {
        const url: UrlModel | null = await Url.findOne({ where: { short_url: req.params.shortCode } }) as UrlModel | null;
    
        if (url) {
            return res.redirect(url.original_url)
        }
    
        return res.sendFile(path.join(__dirname, '../../public/not-found.html'))
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: 'Internal server error'
        })
    }
}


export default { urlshortener, getOriginalUrl }