import Provider from "../models/provider";
import { MediaInfo, MediaResult, Search, Sources } from "../models/types";
declare class AnimeHeaven extends Provider {
    readonly name = "AnimeHeaven";
    baseUrl: string;
    languages: string;
    colorHEX: string;
    logo: string;
    readonly forRN: boolean;
    constructor(customBaseURL?: string);
    search(query: string): Promise<Search<MediaResult>>;
    fetchInfo(id: string): Promise<MediaInfo>;
    fetchSources(id: string): Promise<Sources>;
}
export default AnimeHeaven;
//# sourceMappingURL=AnimeHeaven.d.ts.map