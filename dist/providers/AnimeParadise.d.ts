import { UnifiedMediaInfo, UnifiedSources } from "../models/unifiedTypes";
import Provider from "../models/provider";
import { MediaResult, Search } from "../models/types";
declare class AnimeParadise extends Provider {
    readonly name = "AnimeParadise";
    baseUrl: string;
    languages: string;
    colorHEX: string;
    logo: string;
    readonly forRN: boolean;
    private httpClient;
    constructor(customBaseURL?: string);
    search(query: string): Promise<Search<MediaResult>>;
    fetchInfo(id: string): Promise<UnifiedMediaInfo>;
    fetchSources(id: string): Promise<UnifiedSources>;
}
export default AnimeParadise;
//# sourceMappingURL=AnimeParadise.d.ts.map