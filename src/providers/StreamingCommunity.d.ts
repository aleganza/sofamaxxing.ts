import Provider from '../models/provider';
import { MediaInfo, MediaResult, Search, Sources } from '../models/types';
declare class StreamingCommunity extends Provider {
    readonly name = "StreamingCommunity";
    baseUrl: string;
    CDNUrl: string;
    languages: string[];
    colorHEX: string;
    logo: string;
    readonly forRN: boolean;
    constructor(customBaseURL?: string);
    search(query: string, page?: number): Promise<Search<MediaResult>>;
    fetchInfo: (id: string, season?: number) => Promise<MediaInfo>;
    fetchSources: (id: string, episodeId: number | string) => Promise<Sources>;
}
export default StreamingCommunity;
//# sourceMappingURL=StreamingCommunity.d.ts.map