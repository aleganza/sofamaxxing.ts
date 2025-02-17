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
const custom_provider_1 = __importDefault(require("../models/custom-provider"));
const cheerio = require("react-native-cheerio");
class OnePace extends custom_provider_1.default {
    constructor(customBaseURL) {
        super();
        this.name = "OnePace";
        this.baseUrl = "https://pixeldrain.com";
        this.onePaceUrl = "https://www.onepace.net";
        this.languages = [
            "en",
            "de",
            "es",
            "fr",
            "it",
            "pt",
            "el",
            "ru",
            "ja",
            "ar",
        ];
        this.colorHEX = "#66c0ef";
        this.logo = `${this.onePaceUrl}/favicon.ico`;
        this.forRN = true;
        this.custom = false;
        this.fetchList = (...args_1) => __awaiter(this, [...args_1], void 0, function* (lang = "en") {
            try {
                const res = yield axios_1.default.get(`${this.onePaceUrl}/${lang}/watch`);
                const $ = cheerio.load(res.data);
                const list = $("ol li.scroll-my-6")
                    .toArray()
                    .map((el) => ({
                    title: $(el).find("h2").text().trim(),
                    formats: $(el)
                        .find("ul li.flex")
                        .toArray()
                        .map((elF) => ({
                        title: $(elF).find("h3 span").text().trim(),
                        links: $(elF)
                            .find("ol li")
                            .toArray()
                            .map((elL) => ({
                            id: `l/${$(elL).find("a").attr("href").split("/l/")[1].split("#item")[0]}`,
                            quality: $(elL).find("a span").eq(1).text().trim(),
                        })),
                    })),
                }));
                return list;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        this.fetchArc = (arcId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield axios_1.default.get(`${this.baseUrl}/${arcId}`);
                const $ = cheerio.load(res.data);
                const data = JSON.parse($("script")
                    .html()
                    .toString()
                    .split("window.viewer_data = ")[1]
                    .split("window.user_authenticated")[0]
                    .trim()
                    .replace(/;$/, "")).api_response;
                return {
                    id: data.id,
                    title: data.title,
                    totalEpisodes: data.file_count,
                    episodes: data.files.map((el, index) => ({
                        id: el.id,
                        title: el.name.replace(".mp4", ""), // 💅
                        source: `${this.baseUrl}/api/file/${el.id}`,
                        number: index + 1,
                        description: el.description,
                        size: el.size,
                        type: el.mime_type,
                        thumbnail: `${this.baseUrl}/api${el.thumbnail_href}`,
                    })),
                };
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        this.fetchSource = (arcId) => `${this.baseUrl}/api/file/${arcId}`;
        if (customBaseURL) {
            if (!customBaseURL.startsWith("https://")) {
                throw new Error(`Invalid URL: "${customBaseURL}". The base URL must start with "https://".`);
            }
            this.baseUrl = customBaseURL;
        }
    }
}
exports.default = OnePace;
