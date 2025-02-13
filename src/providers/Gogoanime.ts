import { IAnimeInfo, IAnimeResult, ISearch, ISource, StreamingServers } from '@consumet/extensions';
import CGogoanime from '@consumet/extensions/dist/providers/anime/gogoanime';
import Provider from '../models/provider';

class Gogoanime extends Provider {
  override readonly name = "Gogoanime";
  languages = "en";
  colorHEX = "#dd9933";
  override logo = "https://gogoanime.org.vc/wp-content/uploads/2024/12/cropped-favicon-6-1-32x32.png";
  override readonly forRN: boolean = false;

  private c: CGogoanime;

  constructor(customBaseURL?: string) {
    super(customBaseURL);
    this.c = new CGogoanime(customBaseURL);
  }

  override async search(query: string, page: number = 1): Promise<ISearch<IAnimeResult>> {
    return await this.c.search(query, page);
  }

  override async fetchInfo(id: string): Promise<IAnimeInfo> {
    return await this.c.fetchAnimeInfo(id);
  }

  override async fetchSources(id: string, server?: StreamingServers): Promise<ISource> {
    return await this.c.fetchEpisodeSources(id, server);
  }
}

export default Gogoanime
