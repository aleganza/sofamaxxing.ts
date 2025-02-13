import { IAnimeInfo, IAnimeResult, ISearch, ISource, StreamingServers } from '@consumet/extensions';
import Provider from '../models/provider';
declare class HiAnime extends Provider {
    readonly name = "HiAnime";
    languages: string;
    colorHEX: string;
    logo: string;
    readonly forRN: boolean;
    private c;
    constructor(customBaseURL?: string);
    search(query: string, page?: number): Promise<ISearch<IAnimeResult>>;
    fetchInfo(id: string): Promise<IAnimeInfo>;
    fetchSources(id: string, server?: StreamingServers): Promise<ISource>;
}
export default HiAnime;
//# sourceMappingURL=HiAnime.d.ts.map