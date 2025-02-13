import CustomProvider from "../models/custom-provider";
export type OnePaceList = Array<{
    title: string;
    formats: Array<{
        title: string;
        links: Array<{
            id: string;
            quality: string;
        }>;
    }>;
}>;
export interface OnePaceArc {
    id: string;
    title: string;
    totalEpisodes: number;
    episodes: Array<{
        id: string;
        title: string;
        source: string;
        number: number;
        description: string;
        size: number;
        type: string;
        thumbnail: string;
    }>;
}
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
    fetchList: (lang?: (typeof this.languages)[number]) => Promise<OnePaceList>;
    fetchArc: (arcId: string) => Promise<OnePaceArc>;
    fetchSource: (arcId: string) => string;
}
export default OnePace;
//# sourceMappingURL=OnePace.d.ts.map