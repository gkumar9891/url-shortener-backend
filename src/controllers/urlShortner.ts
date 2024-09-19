import { createHmac } from "crypto";
import Url from "../models/Url";
import path from "path";

const urlShortner = async (req:any, res:any, next:any) => {
    if(!req.body.url) {
        return res.status(400).send(`url is required`)
    }

    const secret = process.env.APP_SECRET!;
    const encryptionAlgo = process.env.APP_ENCRYPTION_ALGO!;
    const appShortUrlLimit = process.env.APP_IDEAL_SHORT_URL_LIMIT!;

    const [from, to] = appShortUrlLimit.split('_');

    //to create unique short url;
    let tempUrl = req.body.url;
    const number = Math.random() * 10000; 
    tempUrl = tempUrl + btoa(number+'') + new Date().toTimeString();
    
    const hash = createHmac(encryptionAlgo, secret)
            .update(tempUrl)
            .digest('hex')
            .slice(parseInt(from), parseInt(to));
               
    const url = await Url.create({
        short_url: hash,
        original_url: req.body.url
    });

    res.send(url.toJSON())      
}

const getOriginalUrl = async (req:any, res:any, next:any) => {
    const url:any = await Url.findOne({where: {short_url : req.params.shortCode}});

    if(!!url) {
        return res.redirect(url.original_url)
    }

    return res.sendFile(path.join(__dirname, '../../public/not-found.html'))
}


export default {urlShortner, getOriginalUrl}