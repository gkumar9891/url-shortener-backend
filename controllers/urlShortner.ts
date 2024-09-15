export const urlShortner = async (req:any, res:any, next:any) => {
    if(!req.body.url) {
        return res.status(400).send(`url is required`)
    }

    return next()
}

export default {urlShortner}