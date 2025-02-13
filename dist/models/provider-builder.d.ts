declare abstract class ProviderBuilder {
    abstract readonly name: string;
    baseUrl: string;
    readonly CDNUrl: string | null;
    abstract readonly languages: string | string[];
    readonly colorHEX: string | null;
    readonly logo: string;
    /**
     * means that this provider uses react-native-cheerio,
     * so that can work for React Native projects
     */
    abstract readonly forRN: boolean;
    /**
     * custom extractor, such as OnePace's
     */
    readonly custom: boolean;
    constructor(customBaseURL?: string);
}
export default ProviderBuilder;
//# sourceMappingURL=provider-builder.d.ts.map