export declare enum MediaStatus {
    FINISHED = "Finished",
    RELEASING = "Releasing",
    NOT_YET_RELEASED = "Not Yet Released",
    CANCELLED = "Cancelled",
    HIATUS = "Hiatus"
}
export declare enum MediaFormat {
    TV = "TV",
    TV_SHORT = "TV Short",
    MOVIE = "Movie",
    SPECIAL = "Special",
    OVA = "OVA",
    ONA = "ONA",
    MUSIC = "Music"
}
export declare enum SubOrDub {
    SUB = "Sub",
    DUB = "Dub",
    BOTH = "Both"
}
export interface Images {
    cover?: string;
    coverMobile?: string;
    logo?: string;
    poster?: string;
    background?: string;
}
export interface FuzzyDate {
    year?: number;
    month?: number;
    day?: number;
}
export interface MediaSeason {
    id: number;
    number: number;
    title?: string;
    description?: string;
    releaseDate?: FuzzyDate;
    totalEpisodes?: number;
}
export interface Subtitle {
    url: string;
    lang: string;
    [x: string]: unknown;
}
export interface Video {
    url: string;
    /**
     * should include the `p` suffix
     */
    quality?: string;
    isM3U8?: boolean;
    isDASH?: boolean;
    /**
     * in bytes
     */
    size?: number;
    /**
     * in seconds
     */
    runtime?: number;
    [x: string]: unknown;
}
export interface MediaEpisode {
    id: string;
    number: number;
    title?: string;
    description?: string;
    isFiller?: boolean;
    image?: string;
    releaseDate?: FuzzyDate;
    runtime?: string;
    [x: string]: unknown;
}
export interface Search<T> {
    currentPage?: number;
    hasNextPage?: boolean;
    totalPages?: number;
    totalResults?: number;
    results: T[];
    [x: string]: unknown;
}
export interface MediaResult {
    id: string;
    title: string;
    image?: string;
    cover?: string;
    status?: MediaStatus;
    rating?: number;
    format?: MediaFormat;
    releaseDate?: FuzzyDate;
    [x: string]: unknown;
}
export interface MediaInfo extends MediaResult {
    hasSeasons: boolean;
    genres?: string[];
    description?: string;
    totalEpisodes?: number;
    totalSeasons?: number;
    subOrDub?: SubOrDub;
    synonyms?: string[];
    color?: string;
    cover?: string;
    banner?: string;
    season?: string;
    episodes?: MediaEpisode[];
    [x: string]: unknown;
}
export interface Sources {
    headers?: {
        [x: string]: string;
    };
    subtitles?: Subtitle[];
    sources: Video[];
    download?: string;
    [x: string]: unknown;
}
//# sourceMappingURL=types.d.ts.map