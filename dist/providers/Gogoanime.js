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
const gogoanime_1 = __importDefault(require("@consumet/extensions/dist/providers/anime/gogoanime"));
const provider_1 = __importDefault(require("../models/provider"));
class Gogoanime extends provider_1.default {
    constructor(customBaseURL) {
        super(customBaseURL);
        this.name = "Gogoanime";
        this.languages = "en";
        this.colorHEX = "#dd9933";
        this.logo = "https://gogoanime.org.vc/wp-content/uploads/2024/12/cropped-favicon-6-1-32x32.png";
        this.forRN = false;
        this.c = new gogoanime_1.default(customBaseURL);
    }
    search(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, page = 1) {
            return yield this.c.search(query, page);
        });
    }
    fetchInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.c.fetchAnimeInfo(id);
        });
    }
    fetchSources(id, server) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.c.fetchEpisodeSources(id, server);
        });
    }
}
exports.default = Gogoanime;
