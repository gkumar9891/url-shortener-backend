import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import urlShortnerRoutes from "./routes/urlShortnerRoutes";
import sequalize from "./db";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss";
import AppError from "./utils/appError";
import path from "path";

const app = express();

// whitelist urls
var whitelist = ['http://127.0.0.1:5500']
var corsOptionsDelegate = function (req: any, callback: any) {
  var corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
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
const sanitizeInput = (req: any, res: any, next: any) => {
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

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use('/api/v1/', cors(corsOptionsDelegate), urlShortnerRoutes);

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


const port = process.env.APP_PORT!;

async function main() {
  let isDatabaseConnected = false;
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
