import { Query } from "../Query/Query";
import { DynamicsBatch } from "./DynamicsBatch";
export declare const WebApiVersion = "v9.1";
export declare const DefaultMaxRecords = 100;
export declare const DynamicsHeaders: {
    'OData-MaxVersion': string;
    'OData-Version': string;
    'Prefer': string;
};
export interface Dynamics {
    batch(): DynamicsBatch;
    fetch<T>(query: Query, maxRowCount?: number): Promise<T[]>;
    save(entitySetName: string, data: any, id?: string): Promise<string>;
}
export default function dynamics(accessToken?: string): Dynamics;
