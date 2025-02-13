"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIsHD = exports.parseImages = exports.parseFuzzyDate = void 0;
const parseFuzzyDate = (rawFuzzyDate) => rawFuzzyDate
    ? {
        year: parseInt(rawFuzzyDate.split("-")[0]),
        month: parseInt(rawFuzzyDate.split("-")[1]),
        day: parseInt(rawFuzzyDate.split("-")[2]),
    }
    : undefined;
exports.parseFuzzyDate = parseFuzzyDate;
const getImageSource = (images, imageType) => images.find((image) => image.type === imageType);
const parseImages = (imagesUrl, images) => ({
    cover: getImageSource(images, "cover")
        ? `${imagesUrl}/${getImageSource(images, "cover").filename}`
        : undefined,
    coverMobile: getImageSource(images, "coverMobile")
        ? `${imagesUrl}/${getImageSource(images, "coverMobile").filename}`
        : undefined,
    logo: getImageSource(images, "logo")
        ? `${imagesUrl}/${getImageSource(images, "logo").filename}`
        : undefined,
    poster: getImageSource(images, "poster")
        ? `${imagesUrl}/${getImageSource(images, "poster").filename}`
        : undefined,
    background: getImageSource(images, "background")
        ? `${imagesUrl}/${getImageSource(images, "background").filename}`
        : undefined,
});
exports.parseImages = parseImages;
const parseIsHD = (rawIsHd) => rawIsHd === 0 ? false : rawIsHd === 1 ? true : undefined;
exports.parseIsHD = parseIsHD;
