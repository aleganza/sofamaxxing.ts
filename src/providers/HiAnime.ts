import { IAnimeInfo, IAnimeResult, ISearch, ISource, StreamingServers } from '@consumet/extensions';
import CZoro from '@consumet/extensions/dist/providers/anime/zoro';
import Provider from '../models/provider';

class HiAnime extends Provider {
  override readonly name = "HiAnime";
  languages = "en";
  colorHEX = "#ffbade";
  override logo = "https://hianime.to/favicon.ico";
  override readonly forRN: boolean = false;

  private c: CZoro;

  constructor(customBaseURL?: string) {
    super(customBaseURL);
    this.c = new CZoro(customBaseURL);
  }

  override async search(query: string, page: number = 1): Promise<ISearch<IAnimeResult>> {
    return await this.c.search(query, page);
  }

  override async fetchInfo(id: string): Promise<IAnimeInfo> {
    return await this.c.fetchAnimeInfo(id);
  }

  override async fetchSources(id: string, server?: StreamingServers): Promise<ISource> {
    try {
      const result = await this.c.fetchEpisodeSources(id, server);
      return result;
    } catch (err) {
      console.error('Error fetching sources (primary attempt):', err);

      try {
        const fallbackResult = await this.c.fetchEpisodeSources(id, StreamingServers.VidStreaming);
        return fallbackResult;
      } catch (fallbackErr) {
        console.error('Error fetching sources (fallback attempt):', fallbackErr);
        throw fallbackErr;
      }
    }
  }

}

export default HiAnime
