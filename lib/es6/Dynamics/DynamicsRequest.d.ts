import { Query } from "../Query/Query";
export declare function dynamicsQuery<T>(query: Query, maxRowCount?: number, headers?: any): Promise<T[]>;
export declare function dynamicsQueryUrl<T>(dynamicsEntitySetUrl: string, query: Query, maxRowCount?: number, headers?: any): Promise<T[]>;
export declare function dynamicsRequest<T>(dynamicsEntitySetUrl: string, headers?: any): Promise<T>;
export declare function dynamicsSave(entitySetName: string, data: any, id?: string, headers?: any): Promise<string>;
export declare function formatDynamicsResponse(data: any): any;
