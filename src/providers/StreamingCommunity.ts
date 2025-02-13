import axios from 'axios';

import Provider from '../models/provider';
import { MediaEpisode, MediaInfo, MediaResult, MediaSeason, Search, Sources, SubOrDub } from '../models/types';
import { parseFuzzyDate, parseImages } from '../modules/utils/streamingcommunity';

const cheerio = require("react-native-cheerio");

class StreamingCommunity extends Provider {
  override readonly name = "StreamingCommunity";
  override baseUrl = "https://streamingcommunity.paris";
  override CDNUrl = "https://cdn.streamingcommunity.photos/images";
  languages = ["it", "en"];
  colorHEX = "#018850";
  override logo = `${this.baseUrl}/icon/favicon-32x32.png?v=2`;
  override readonly forRN: boolean = true

  constructor(customBaseURL?: string) {
    super(customBaseURL);
  }
  
  override async search(
    query: string,
    page: number = 1
  ): Promise<Search<MediaResult>> {
    try {
      const res = await axios.get(`${this.baseUrl}/api/search?q=${query}`);

      // pagination ain't workin :(
      // const res = await axios.get(`${this.baseUrl}/api/search?q=${query}&page=${page}`);

      const searchResult: Search<MediaResult> = {
        currentPage: res.data.current_page,
        hasNextPage: res.data.current_page !== res.data.last_page,
        totalPages: res.data.last_page,
        totalResults: res.data.total,
        results: [],
      };

      res.data.data.forEach((el: any) =>
        searchResult.results.push({
          id: `${el.id}-${el.slug}`,
          title: el.name,
          type: el.type ?? undefined,
          rating: parseFloat(el?.score),
          subOrDub: el.sub_ita === 0 ? SubOrDub.DUB : SubOrDub.SUB,
          lastAirDate: parseFuzzyDate(el.last_air_date),
          seasonsCount: el.seasons_count ?? undefined,
          images: parseImages(this.CDNUrl, el.images),
        })
      );

      return searchResult;
    } catch (error) {
      console.log(error);
      throw new Error((error as Error).message);
    }
  }

  override fetchInfo = async (
    id: string,
    season: number = 1
  ): Promise<MediaInfo> => {
    try {
      const res = await axios.get(
        `${this.baseUrl}/titles/${id}/stagione-${season}`
      );
      const $ = cheerio.load(res.data);

      const data = JSON.parse("" + $("#app").attr("data-page") + "").props;

      const result: MediaInfo = {
        id: `${data.title.id}-${data.title.slug}`,
        hasSeasons: true,
        title: data.title.name,
        description: data.title.plot ?? undefined,
        quality: data.title.quality ?? undefined,
        synonyms: data.title.original_name ? [data.title.original_name] : [],
        runtime: data.title.runtime ?? undefined,
        score: parseFloat(data.title.score),
        releaseDate: parseFuzzyDate(data.title.release_date),
        subOrDub: data.title.sub_ita === 0 ? SubOrDub.DUB : SubOrDub.SUB,
        totalSeasons: data.title.seasons_count ?? undefined,
        seasons:
          data.title.seasons.map((el: any): MediaSeason => {
            return {
              id: el.id,
              number: el.number,
              title: el.name ?? undefined,
              description: el.plot ?? undefined,
              releaseDate: parseFuzzyDate(el.release_date),
              totalEpisodes: el.episodes_count ?? undefined,
            };
          }) ?? undefined,
        images: parseImages(this.CDNUrl, data.title.images),
        genres: data.title.genres.map((el: any): string => {
          return el.name;
        }),
        episodes: data.loadedSeason.episodes.map((el: any): MediaEpisode => {
          return {
            id: el.id,
            number: el.number,
            title: el.name ?? undefined,
            description: el.plot ?? undefined,
            runtime: el.duration ?? undefined,
            images: parseImages(this.CDNUrl, el.images),
          };
        }),
        // type: data.title.type ?? undefined,
        // originalTitle: data.title.original_name ?? undefined,
        // status: data.title.status ?? undefined,
        // views: data.title.views ?? undefined,
        // dailyViews: data.title.daily_views ?? undefined,
        // lastAirDate: parseFuzzyDate(data.title.last_air_date),
        // preview: data.title.preview ?? undefined,
        // keywords: data.title.keywords.map((el: any): string => {
        //   return el.name;
        // }),
      };

      return result;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  };

  override fetchSources = async (
    id: string,
    episodeId: number | string
  ): Promise<Sources> => {
    try {
      const res = await axios.get(
        `${this.baseUrl}/iframe/${id}?episode_id=${episodeId}&next_episode=1`
      );
      const $ = cheerio.load(res.data);
      const url = $("iframe").attr("src");

      const episodeSources: Sources = {
        sources: [],
      };

      if (url) {
        const res = await axios.get(url);
        const $ = cheerio.load(res.data);

        const scriptContent = $('script:contains("window.video")')
          .html()
          .toString();

        const domain = scriptContent.match(/url: '(.*)'/)?.[1];
        const token = scriptContent.match(/token': '(.*)'/)?.[1];
        const expires = scriptContent.match(/expires': '(.*)'/)?.[1];
        const canPlayFHD = scriptContent.match(
          /window.canPlayFHD = (true|false)/
        )?.[1];

        episodeSources.sources.push({
          url: `${domain}?token=${token}&expires=${expires}${
            canPlayFHD === "true" ? "$h=1" : ""
          }`,
          quality: `default`,
          isM3U8: true,
        });
      }

      return episodeSources;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  };
}

export default StreamingCommunity;
