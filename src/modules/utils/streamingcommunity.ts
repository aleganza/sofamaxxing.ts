import { FuzzyDate, Images } from "../../models/types";

export const parseFuzzyDate = (rawFuzzyDate: string): FuzzyDate | undefined =>
  rawFuzzyDate
    ? {
        year: parseInt(rawFuzzyDate.split("-")[0]),
        month: parseInt(rawFuzzyDate.split("-")[1]),
        day: parseInt(rawFuzzyDate.split("-")[2]),
      }
    : undefined;

const getImageSource = (images: any, imageType: string) =>
  images.find((image: any) => image.type === imageType);

export const parseImages = (
  imagesUrl: string,
  images: any[]
): Images | undefined => ({
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

export const parseIsHD = (rawIsHd: number): boolean | undefined =>
  rawIsHd === 0 ? false : rawIsHd === 1 ? true : undefined;
