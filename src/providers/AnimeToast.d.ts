import Provider from '../models/provider';
import { MediaInfo, MediaResult, Search, Sources } from '../models/types';
declare class AnimeToast extends Provider {
    readonly name = "AnimeToast";
    baseUrl: string;
    languages: string;
    colorHEX: string;
    logo: string;
    readonly forRN: boolean;
    constructor(customBaseURL?: string);
    search(query: string, page?: number): Promise<Search<MediaResult>>;
    /**
     * PAGES SYSTEMS IS RARELY BROKEN (url pattern mismatch)
     *
     * @param id
     * @param page
     * @returns
     */
    fetchInfo(id: string, page?: number): Promise<MediaInfo>;
    fetchSources(id: string): Promise<Sources>;
}
export default AnimeToast;
//# sourceMappingURL=AnimeToast.d.ts.map