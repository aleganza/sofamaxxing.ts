import Provider from '../models/provider';
import { MediaInfo, MediaResult, Search, Sources } from '../models/types';
declare class TokyoInsider extends Provider {
    readonly name = "TokyoInsider";
    baseUrl: string;
    languages: string;
    colorHEX: string;
    logo: string;
    readonly forRN: boolean;
    constructor(customBaseURL?: string);
    search(query: string, page?: number): Promise<Search<MediaResult>>;
    fetchInfo(id: string): Promise<MediaInfo>;
    fetchSources(id: string): Promise<Sources>;
}
export default TokyoInsider;
//# sourceMappingURL=TokyoInsider.d.ts.map