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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class HttpClient {
    constructor(baseURL) {
        this.axiosInstance = axios_1.default.create({
            baseURL,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', // User-Agent di default
                'Accept': 'application/json',
                'Connection': 'keep-alive',
            }
        });
    }
    setCookies(cookies) {
        this.axiosInstance.defaults.headers['Cookie'] = cookies;
    }
    get(url_1) {
        return __awaiter(this, arguments, void 0, function* (url, config = {}) {
            try {
                const response = yield this.axiosInstance.get(url, config);
                return response;
            }
            catch (error) {
                console.error('Error in GET request:', error);
                throw error;
            }
        });
    }
    post(url_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (url, data, config = {}) {
            try {
                const response = yield this.axiosInstance.post(url, data, config);
                return response;
            }
            catch (error) {
                console.error('Error in POST request:', error);
                throw error;
            }
        });
    }
}
exports.default = HttpClient;
