"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlShortner = void 0;
const urlShortner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.url) {
        return res.status(400).send(`source is required`);
    }
    return next();
});
exports.urlShortner = urlShortner;
exports.default = { urlShortner: exports.urlShortner };
//# sourceMappingURL=urlShortner.js.map