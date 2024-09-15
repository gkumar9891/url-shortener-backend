"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const urlShortnerRoutes_1 = __importDefault(require("./routes/urlShortnerRoutes"));
const app = (0, express_1.default)();
//whitelist urls
var whitelist = ['http://127.0.0.1:5500'];
var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    }
    else {
        corsOptions = { origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
};
app.use('/api/v1/', (0, cors_1.default)(corsOptionsDelegate), urlShortnerRoutes_1.default);
const port = 8080;
debugger;
app.listen(port, () => {
    console.log(`app is listening on port ${port}`);
});
//# sourceMappingURL=index.js.map