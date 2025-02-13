import ProviderBuilder from "./provider-builder";
import { UnifiedMediaInfo, UnifiedMediaResult, UnifiedSearch, UnifiedSources } from "./unifiedTypes";
declare abstract class Provider extends ProviderBuilder {
    abstract search?(query: string, ...args: any): Promise<UnifiedSearch<UnifiedMediaResult>>;
    abstract fetchInfo?(id: string | number, ...args: any): Promise<UnifiedMediaInfo>;
    abstract fetchSources?(id: string | number, ...args: any): Promise<UnifiedSources>;
}
export default Provider;
//# sourceMappingURL=provider.d.ts.map