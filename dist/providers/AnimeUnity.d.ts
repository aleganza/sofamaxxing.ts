import Provider from "../models/provider";
import { MediaInfo, MediaResult, Search, Sources } from "../models/types";
declare class AnimeUnity extends Provider {
    readonly name = "AnimeUnity";
    baseUrl: string;
    languages: string;
    colorHEX: string;
    logo: string;
    readonly forRN: boolean;
    private httpClient;
    constructor(customBaseURL?: string);
    search: (query: string) => Promise<Search<MediaResult>>;
    fetchInfo: (id: string, page?: number) => Promise<MediaInfo>;
    fetchSources: (episodeId: string) => Promise<Sources>;
}
export default AnimeUnity;
//# sourceMappingURL=AnimeUnity.d.ts.map