abstract class ProviderBuilder {
  abstract readonly name: string;

  baseUrl: string = "";

  readonly CDNUrl: string | null = null;

  abstract readonly languages: string | string[];

  readonly colorHEX: string | null = null;

  readonly logo: string =
    "https://png.pngtree.com/png-vector/20210221/ourmid/pngtree-error-404-not-found-neon-effect-png-image_2928214.jpg";

  /**
   * means that this provider uses react-native-cheerio,
   * so that can work for React Native projects
   */
  abstract readonly forRN: boolean;

  /**
   * custom extractor, such as OnePace's
   */
  readonly custom: boolean = false;

  constructor(customBaseURL?: string) {
    if (customBaseURL) {
      if (!customBaseURL.startsWith("https://")) {
        throw new Error(
          `Invalid URL: "${customBaseURL}". The base URL must start with "https://".`
        );
      }
      this.baseUrl = customBaseURL;
    }
  }
}

export default ProviderBuilder;
