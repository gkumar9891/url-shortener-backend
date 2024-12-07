import dotenv from "dotenv";
dotenv.config();

import express, {Request, Response, NextFunction as Next} from "express";
import cors from "cors";
import urlshortenerRoutes from "./routes/urlShortenerRoutes";
import downloadRoutes from "./routes/downloadRoutes";
import sequalize from "./db";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss";
import path from "path";
import urlShortenerController from "./controllers/urlShortener";
import AppError from './utils/appError';
import globalErrorHandler from './controllers/errorController';

const app = express();

// Serving static files
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../output')));

// whitelist urls
let whitelist:string|string[] = process.env.APP_WHITELIST_URLS! as string;
whitelist= whitelist.split(',');

const corsOptionsDelegate = function (req:Request, callback: (err: Error | null, options: { origin: boolean }) => void) {
  let corsOptions;
  const origin:string = req.header('Origin')!;
  if (whitelist.indexOf(origin) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security HTTP headers
app.use(helmet());
// Data sanitization against XSS
// Middleware to sanitize user inputs
const sanitizeInput = (req: Request, res: Response, next: Next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
}

app.use(sanitizeInput);

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 1000 * 60,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/', limiter);

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cors(corsOptionsDelegate));
// app.get('/:shortCode', urlShortenerController.getOriginalUrl); //created as alias to find full url in less characters
app.use('/api/v1/url-shortener', urlshortenerRoutes);
app.use('/api/v1/download', downloadRoutes);

app.all('*', (req: Request, res: Response, next: Next) => {
  next(AppError.create(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);


const port = process.env.APP_PORT! || "8080";

async function main() {
  let isDatabaseConnected:boolean = false;
  await sequalize.sync()
    .then(() => {
      isDatabaseConnected = true;
      console.log(`database connected successfully`);
    })
    .catch(err => {
      console.error(`Unable to connect to the database`, err);
    })

  if (isDatabaseConnected) {
    app.listen(parseInt(port), () => {
      console.log(`app is listening on port ${port}`)
    })
  }
}

main();

export default app;
