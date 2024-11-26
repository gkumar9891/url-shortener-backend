import { createHmac } from "crypto";
import Url, { UrlModel } from "../models/Url";
import { Request, Response, NextFunction as Next, NextFunction } from "express";
import catchAsync from '../utils/catchAsync';
import AppError from "../utils/appError";
import xlsx from 'xlsx';
import puppeteer from 'puppeteer';
import fs from 'fs';

export interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

const validURL = (str: string) => {
    const pattern: RegExp = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

const makeShortUrl = async (url:string, expiryDate:string) => {
    if (!url) {
        throw AppError.create(`url is required`, 400);
    } else if (!validURL(url)) {
        throw AppError.create(`url is not valid`, 400);
    }

    const _expiryDate = new Date(expiryDate);
    if (expiryDate && isNaN(_expiryDate.getTime())) {
        throw AppError.create('Invalid date format', 400);
    } else if(expiryDate && _expiryDate.getTime() < new Date().getTime()) {
        throw AppError.create(`expiry date should be greater than today`, 400);
    }


    const secret: string = process.env.APP_SECRET! as string;
    const encryptionAlgo: string = process.env.APP_ENCRYPTION_ALGO! as string;
    const appShortUrlLimit: string = process.env.APP_IDEAL_SHORT_URL_LIMIT! as string;

    const [from, to]: [string, string] = appShortUrlLimit.split('_') as [string, string];

    //to create unique short url;
    let tempUrl: string = url;
    const number: number = Math.random() * 10000;
    tempUrl = tempUrl + btoa(number + '') + new Date().toTimeString();

    const hash: string = createHmac(encryptionAlgo, secret)
        .update(tempUrl)
        .digest('hex')
        .slice(parseInt(from), parseInt(to));

    const urlRegex = /^(https?:\/\/)/;

    if (!urlRegex.test(url)) {
        url = `https://${Url}`
    }

    const _url = await Url.create({
        short_url: hash,
        original_url: url,
        expiry_date: expiryDate || null
    });

    return _url;
}

const urlshortener = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let { expiryDate, url } = req.body;
    let _url:any;
    _url = await makeShortUrl(url, expiryDate);
    
    res.status(200).send({
        status: 'success',
        data: _url.toJSON()
    })
})

const getOriginalUrl = catchAsync(async (req: Request, res: Response, next: Next) => {
    const url: UrlModel | null = await Url.findOne({ where: { short_url: req.params.shortCode } }) as UrlModel | null;

    if (url) {

        if(url.expiry_date && url.expiry_date < new Date()) {
            return next(AppError.create(`url is expired`, 410));
        }

        return res.status(200).json({ 
            status: 'success',
            data: url.toJSON()
        });
    }

    next(AppError.create(`not-found`, 404));
})

const createAlias = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { shortCode, url, expiryDate } = req.body;

    if (!shortCode || !url) {
        next(AppError.create(`plese pass short code and url`, 400));
    }

    let shortUrlLimit = process.env.APP_IDEAL_SHORT_URL_LIMIT! as string;

    let limit = shortUrlLimit.split('_');

    let shortCodelength = parseInt(limit[1]) - parseInt(limit[0]);

    if (shortCode.length < shortCodelength) {
        return next(AppError.create(`shortCode length should be atleast ${shortCodelength}`, 400));
    }

    const _expiryDate = new Date(req.body.expiryDate);
    if (req.body.expiryDate && isNaN(_expiryDate.getTime())) {
        return next(AppError.create('Invalid date format', 400));
    } else if(req.body.expiryDate && _expiryDate.getTime() < new Date().getTime()) {
        return next(AppError.create(`expiry date should be greater than today`, 400));
    }

    try {
        const _url = await Url.create({
            short_url: shortCode,
            original_url: url,
            expiry_date: expiryDate || null
        })

        res.status(201).json({
            status: 'success',
            data: _url.toJSON()
        });
    } catch (err: any) {
        if (err.original.code == "ER_DUP_ENTRY") {
            return next(AppError.create(`pass another unique short code`, 400));
        }

        next(err);
    }
});

const bulkCreate = catchAsync(async(req: MulterRequest, res: Response, next: NextFunction) => {
     // Load and parse the Excel file
     const workbook = xlsx.readFile(req.file!.path!);
     const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Use the first sheet
     const data = xlsx.utils.sheet_to_json<{ url: string, expiryDate: Date }>(sheet); // Convert to JSON format


     const result = await Promise.allSettled(
        data.map(async (row) => {
            const url = row.url;
            let expiryDate:any = Number(row.expiryDate);

            const excelStartDate = new Date(1900, 0, 1);
            expiryDate = new Date(excelStartDate.getTime() + (expiryDate - 1) * 24 * 60 * 60 * 1000).toDateString();
            const shortUrl = await makeShortUrl(url, expiryDate);
            return shortUrl;
        })
    );

    const _result = result.reduce((acc:any, el:any) => {

        if(el.status == 'rejected')
            return acc;

        el.value.short_url = el.value.short_url

        return [...acc, el.value];
    }, []);


    // create xlsx file
    const _workbook = xlsx.utils.book_new();
    const _worksheet = xlsx.utils.json_to_sheet(_result);

    xlsx.utils.book_append_sheet(_workbook, _worksheet, "Sheet1");
    const filePath = `./output/${new Date().getTime()}.xlsx`;
    if (!fs.existsSync("./output")) {
        fs.mkdirSync("./output");
    }
    xlsx.writeFile(_workbook, filePath);
    res.status(200).send({
        data: filePath
    })
});


export default { urlshortener, getOriginalUrl, createAlias, bulkCreate }