import { Query } from "../Query/Query";
export interface DynamicsBatch {
    execute(): Promise<any[]>;
    request(query: Query, maxRowCount?: number): DynamicsBatch;
    requestAll(queries: Query[]): DynamicsBatch;
    requestAllUrls(urls: string[]): DynamicsBatch;
    saveEntity(entitySetName: string, data: any, id?: string): DynamicsBatch & {
        createRelatedEntity(entitySetName: string, data: any, navigationPropertyName: string): void;
    };
}
export declare function dynamicsBatch(headers?: any): DynamicsBatch;
export declare function dynamicsBatchRequest<T = any>(...url: string[]): Promise<T[]>;
export declare function dynamicsBatchQuery<T = any>(...query: Query[]): Promise<T[]>;
