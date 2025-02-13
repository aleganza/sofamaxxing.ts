import HttpClient from "../models/http-client";

import Provider from "../models/provider";
import {
  MediaInfo,
  MediaResult,
  Search,
  Sources,
  SubOrDub,
} from "../models/types";

const cheerio = require("react-native-cheerio");

class AnimeUnity extends Provider {
  override readonly name = "AnimeUnity";
  override baseUrl = "https://www.animeunity.so";
  languages = "it";
  colorHEX = "#007bff";
  override logo = "https://www.animeunity.to/favicon-32x32.png";
  override readonly forRN: boolean = true;

  private httpClient: HttpClient;

  constructor(customBaseURL?: string) {
    super(customBaseURL);
    this.httpClient = new HttpClient(this.baseUrl);
  }

  override search = async (query: string): Promise<Search<MediaResult>> => {
    try {
      const res = await this.httpClient.get(`/archivio?title=${query}`, {
        headers: {
          Referer: this.baseUrl,
        },
      });

      const $ = cheerio.load(res.data);

      if (!$) return { results: [] };

      const items = JSON.parse("" + $("archivio").attr("records") + "");

      const searchResult: {
        hasNextPage: boolean;
        results: MediaResult[];
      } = {
        hasNextPage: false,
        results: [],
      };

      for (const i in items) {
        searchResult.results.push({
          id: `${items[i].id}-${items[i].slug}`,
          title: items[i].title ?? items[i].title_eng,
          url: `${this.baseUrl}/anime/${items[i].id}-${items[i].slug}`,
          image: items[i].imageurl,
          cover: items[i].imageurl_cover,
          rating: parseFloat(items[i].score),
          releaseDate: items[i].date,
          subOrDub: `${items[i].dub ? SubOrDub.DUB : SubOrDub.SUB}`,
        });
      }

      return searchResult;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchInfo = async (
    id: string,
    page: number = 1
  ): Promise<MediaInfo> => {
    const url = `${this.baseUrl}/anime/${id}`;
    const episodesPerPage = 120;
    const lastPageEpisode = page * episodesPerPage;
    const firstPageEpisode = lastPageEpisode - 119;
    const url2 = `${this.baseUrl}/info_api/${id}/1?start_range=${firstPageEpisode}&end_range=${lastPageEpisode}`;

    try {
      // Richiesta alla pagina dell'anime
      const res = await this.httpClient.get(url);
      const $ = cheerio.load(res.data);

      const totalEpisodes = parseInt(
        $("video-player")?.attr("episodes_count") ?? "0"
      );
      const totalPages = Math.round(totalEpisodes / 120) + 1;

      if (page < 1 || page > totalPages)
        throw new Error(
          `Argument 'page' for ${id} must be between 1 and ${totalPages}! (You passed ${page})`
        );

      const animeInfo: MediaInfo = {
        currentPage: page,
        hasNextPage: totalPages > page,
        totalPages: totalPages,
        id: id,
        hasSeasons: false,
        title: $("h1.title")?.text().trim(),
        genres:
          $(".info-wrapper.pt-3.pb-3 small")
            ?.map((_: any, element: any): string => {
              return $(element).text().replace(",", "").trim();
            })
            .toArray() ?? undefined,
        totalEpisodes: totalEpisodes,
        image: $("img.cover")?.attr("src"),
        cover:
          $(".banner")?.attr("src") ??
          $(".banner")?.attr("style")?.replace("background: url(", ""),
        description: $(".description").text().trim(),
        episodes: [],
      };

      const res2 = (await this.httpClient.get(url2)) as any;
      const items = res2.data.episodes;

      for (const i in items) {
        animeInfo.episodes?.push({
          id: `${id}/${items[i].id}`,
          number: parseInt(items[i].number),
          url: `${url}/${items[i].id}`,
        });
      }

      return animeInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchSources = async (episodeId: string): Promise<Sources> => {
    try {
      const res = await this.httpClient.get(
        `${this.baseUrl}/anime/${episodeId}`
      );

      const $ = cheerio.load(res.data);

      const episodeSources: Sources = {
        headers: {},
        sources: [],
      };

      const streamUrl = $("video-player").attr("embed_url");

      if (streamUrl) {
        const res = await this.httpClient.get(streamUrl);
        const $ = cheerio.load(res.data);

        const domain = $('script:contains("window.video")')
          .html()
          .toString()
          ?.match(/url: '(.*)'/)![1];
        const token = $('script:contains("window.video")')
          .html()
          .toString()
          ?.match(/token': '(.*)'/)![1];
        const expires = $('script:contains("window.video")')
          .html()
          .toString()
          ?.match(/expires': '(.*)'/)![1];

        const size = Number(
          $('script:contains("window.video")')
            .html()
            .toString()
            ?.match(/"size":(\d+)/)?.[1]
        );
        const runtime = Number(
          $('script:contains("window.video")')
            .html()
            .toString()
            ?.match(/"duration":(\d+)/)?.[1]
        );

        const defaultUrl = `${domain}${domain.includes("?") ? "&" : "?"}token=${token}&referer=&expires=${expires}&h=1`;

        const m3u8Content = (await this.httpClient.get(defaultUrl)) as any;

        if (m3u8Content.data.includes("EXTM3U")) {
          const videoList = m3u8Content.data.split("#EXT-X-STREAM-INF:");
          for (const video of videoList ?? []) {
            if (video.includes("BANDWIDTH")) {
              const url = video.split("\n")[1];
              const quality = video
                .split("RESOLUTION=")[1]
                .split("\n")[0]
                .split("x")[1];

              episodeSources.sources.push({
                url: url,
                quality: `${quality}p`,
                isM3U8: true,
              });
            }
          }
        }

        episodeSources.sources.push({
          url: defaultUrl,
          quality: `default`,
          isM3U8: true,
          size: size * 1024,
          runtime,
        });

        episodeSources.download = $('script:contains("window.downloadUrl ")')
          .html()
          .toString()
          ?.match(/downloadUrl = '(.*)'/)![1]
          ?.toString();
      }

      return episodeSources;
    } catch (err) {
      console.error("Error fetching episode sources:", err);
      throw new Error((err as Error).message);
    }
  };
}

export default AnimeUnity;
