import { createHmac } from "crypto";
import Url from "../models/Url";

export const urlShortner = async (req:any, res:any, next:any) => {
    debugger
    if(!req.body.url) {
        return res.status(400).send(`url is required`)
    }

    const secret = process.env.APP_SECRET!;
    const encryptionAlgo = process.env.APP_ENCRYPTION_ALGO!;
    const appShortUrlLimit = process.env.APP_IDEAL_SHORT_URL_LIMIT!;

    const [from, to] = appShortUrlLimit.split('_');
    
    //created hash
    let hash = createHmac(encryptionAlgo, secret)
               .update(req.body.url)
               .digest('hex')
               .slice(parseInt(from), parseInt(to));
    
    const isUrlExist = await Url.findOne({where: { short_url: hash}});

    //to create unique short url;
    if(isUrlExist) {
        let tempUrl = req.body.url;
        const number = Math.random() * 10000; 
        tempUrl = tempUrl + btoa(number+'');
        
        hash = createHmac(encryptionAlgo, secret)
                .update(tempUrl)
                .digest('hex')
                .slice(parseInt(from), parseInt(to));
    }
               
    const url = await Url.create({
        short_url: hash,
        original_url: req.body.url
    });

    res.send(url.toJSON())      
}

export default {urlShortner}