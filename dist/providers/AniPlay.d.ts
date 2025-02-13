import { UnifiedMediaInfo, UnifiedSources } from "../models/unifiedTypes";
import Provider from "../models/provider";
import { MediaResult, Search } from "../models/types";
declare class AniPlay extends Provider {
    readonly name = "AniPlay";
    baseUrl: string;
    languages: string;
    colorHEX: string;
    logo: string;
    readonly forRN: boolean;
    private httpClient;
    constructor(customBaseURL?: string);
    search(query: string): Promise<Search<MediaResult>>;
    private getDetailFromText;
    fetchInfo(id: string): Promise<UnifiedMediaInfo>;
    fetchSources(id: string, host?: "maze" | "pahe" | "yuki", type?: "sub" | "dub"): Promise<UnifiedSources>;
}
export default AniPlay;
//# sourceMappingURL=AniPlay.d.ts.map