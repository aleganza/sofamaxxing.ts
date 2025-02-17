import CustomProvider from "../models/custom-provider";
import { UnifiedSearch, UnifiedMediaResult, UnifiedMediaInfo, UnifiedSources } from "src/models/unifiedTypes";
declare class OnePace extends CustomProvider {
    readonly name = "OnePace";
    baseUrl: string;
    private onePaceUrl;
    languages: string[];
    colorHEX: string;
    logo: string;
    readonly forRN: boolean;
    readonly custom: boolean;
    constructor(customBaseURL?: string);
    search(query: string): Promise<UnifiedSearch<UnifiedMediaResult>>;
    fetchInfo(season?: number, dubbed?: boolean): Promise<UnifiedMediaInfo>;
    fetchSources(id: string): UnifiedSources;
}
export default OnePace;
//# sourceMappingURL=OnePace.d.ts.map