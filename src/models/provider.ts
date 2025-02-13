import ProviderBuilder from "./provider-builder";
import { Search, MediaResult, MediaInfo, Sources } from "./types";
import {
  UnifiedMediaInfo,
  UnifiedMediaResult,
  UnifiedSearch,
  UnifiedSources,
} from "./unifiedTypes";

abstract class Provider extends ProviderBuilder {
  abstract search?(
    query: string,
    ...args: any
  ): Promise<UnifiedSearch<UnifiedMediaResult>>;

  abstract fetchInfo?(
    id: string | number,
    ...args: any
  ): Promise<UnifiedMediaInfo>;

  abstract fetchSources?(
    id: string | number,
    ...args: any
  ): Promise<UnifiedSources>;
}

export default Provider;
