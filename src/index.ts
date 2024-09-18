import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import urlShortnerRoutes from './routes/urlShortnerRoutes';
import sequalize from './db'
const app = express();

//whitelist urls
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

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use('/api/v1/', cors(corsOptionsDelegate), urlShortnerRoutes);

const port = process.env.APP_PORT!;

async function main() {
  let isDatabaseConnected = false;
  await sequalize.sync()
    .then(() => {
      isDatabaseConnected = true;
      console.log(`database connected successfully`);
    })
    .catch(err => {
      console.error(`Unable to connect to the database`);
    })

  if (isDatabaseConnected) {
    app.listen(parseInt(port), () => {
      console.log(`app is listening on port ${port}`)
    })
  }
}

main();
