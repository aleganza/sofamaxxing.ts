import axios from "axios";

import CustomProvider from "../models/custom-provider";

const cheerio = require("react-native-cheerio");

export type OnePaceList = Array<{
  title: string;
  formats: Array<{
    title: string;
    links: Array<{
      id: string;
      quality: string;
    }>;
  }>;
}>;

export interface OnePaceArc {
  id: string;
  title: string;
  totalEpisodes: number;
  episodes: Array<{
    id: string;
    title: string;
    source: string;
    number: number;
    description: string;
    size: number; // in Bytes
    type: string;
    thumbnail: string;
  }>;
}

class OnePace extends CustomProvider {
  override readonly name = "OnePace";
  override baseUrl = "https://pixeldrain.com";
  private onePaceUrl = "https://www.onepace.net";
  languages: string[] = [
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
  ] as const;
  colorHEX = "#66c0ef";
  override logo = `${this.onePaceUrl}/favicon.ico`;
  override readonly forRN: boolean = true;
  override readonly custom: boolean = false;

  constructor(customBaseURL?: string) {
    super();
    if (customBaseURL) {
      if (!customBaseURL.startsWith("https://")) {
        throw new Error(
          `Invalid URL: "${customBaseURL}". The base URL must start with "https://".`
        );
      }
      this.baseUrl = customBaseURL;
    }
  }

  fetchList = async (
    lang: (typeof this.languages)[number] = "en"
  ): Promise<OnePaceList> => {
    try {
      const res = await axios.get(`${this.onePaceUrl}/${lang}/watch`);
      const $ = cheerio.load(res.data);

      const list: OnePaceList = $("ol li.scroll-my-6")
        .toArray()
        .map((el: any) => ({
          title: $(el).find("h2").text().trim(),
          formats: $(el)
            .find("ul li.flex")
            .toArray()
            .map((elF: any) => ({
              title: $(elF).find("h3 span").text().trim(),
              links: $(elF)
                .find("ol li")
                .toArray()
                .map((elL: any) => ({
                  id: `l/${$(elL).find("a").attr("href").split("/l/")[1].split("#item")[0]}`,
                  quality: $(elL).find("a span").eq(1).text().trim(),
                })),
            })),
        }));

      return list;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  fetchArc = async (arcId: string): Promise<OnePaceArc> => {
    try {
      const res = await axios.get(`${this.baseUrl}/${arcId}`);
      const $ = cheerio.load(res.data);

      const data = JSON.parse(
        $("script")
          .html()
          .toString()
          .split("window.viewer_data = ")[1]
          .split("window.user_authenticated")[0]
          .trim()
          .replace(/;$/, "")
      ).api_response;

      return {
        id: data.id,
        title: data.title,
        totalEpisodes: data.file_count,
        episodes: data.files.map((el: any, index: number) => ({
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
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  fetchSource = (arcId: string): string => `${this.baseUrl}/api/file/${arcId}`;
}

export default OnePace;
