declare module "Query/Query" {
    export interface DataQuery {
        Alias: any;
        EntityName: string;
        EntityPath?: string;
        Attributes: Set<string>;
        OrderBy: Set<string>;
        Conditions: (DataQueryCondition | DataQueryCondition[])[];
        Joins: DataQueryJoin[];
    }
    export interface DataQueryCondition {
        AttributeName: string;
        Operator: QueryOperator;
        Values: any[];
    }
    export interface DataQueryJoin extends DataQuery {
        JoinAlias?: string;
        JoinFromAttributeName?: string;
        JoinToAttributeName?: string;
        IsOuterJoin?: boolean;
        RootQuery: Query;
    }
    export interface Query {
        alias(attributeName: string, alias: string): Query;
        path(entityPath: string): Query;
        select(...attributeNames: string[]): Query;
        where(attributeName: string, operator: QueryOperator, ...values: any[]): Query;
        whereAny(any: (or: (attributeName: string, operator: QueryOperator, ...values: any[]) => void) => void): Query;
        orderBy(attributeName: string, isDescendingOrder?: boolean): Query;
        join(entityName: string, fromAttribute: string, toAttribute?: string, alias?: string, isOuterJoin?: boolean): Query;
        Query: DataQuery;
    }
    export enum QueryOperator {
        Contains = "like",
        StartsWith = "begins-with",
        Equals = "eq",
        NotEquals = "neq",
        GreaterThan = "gt",
        LessThan = "lt",
        In = "in",
        NotIn = "not-in",
        OnOrBefore = "on-or-before",
        OnOrAfter = "on-or-after",
        Null = "null",
        NotNull = "not-null",
        IsCurrentUser = "eq-userid",
        IsNotCurrentUser = "ne-userid",
        IsCurrentUserTeam = "eq-userteams"
    }
    export default function query(entityName: string, ...attributeNames: string[]): Query;
    export function GetRootQuery(query: Query): DataQuery;
}
declare module "Query/QueryXml" {
    import { Query } from "Query/Query";
    export default function GetQueryXml(query: Query, maxRowCount?: number, format?: boolean): any;
}
declare module "Dynamics/DynamicsRequest" {
    import { Query } from "Query/Query";
    export function dynamicsQuery<T>(query: Query, maxRowCount?: number, headers?: any): Promise<T[]>;
    export function dynamicsQueryUrl<T>(dynamicsEntitySetUrl: string, query: Query, maxRowCount?: number, headers?: any): Promise<T[]>;
    export function dynamicsRequest<T>(dynamicsEntitySetUrl: string, headers?: any): Promise<T>;
    export function dynamicsSave(entitySetName: string, data: any, id?: string, headers?: any): Promise<string>;
    export function formatDynamicsResponse(data: any): any;
}
declare module "Dynamics/DynamicsBatch" {
    import { Query } from "Query/Query";
    export interface DynamicsBatch {
        execute(): Promise<any[]>;
        request(query: Query, maxRowCount?: number): DynamicsBatch;
        requestAll(queries: Query[]): DynamicsBatch;
        requestAllUrls(urls: string[]): DynamicsBatch;
        saveEntity(entitySetName: string, data: any, id?: string): DynamicsBatch & {
            createRelatedEntity(entitySetName: string, data: any, navigationPropertyName: string): void;
        };
    }
    export function dynamicsBatch(headers?: any): DynamicsBatch;
    export function dynamicsBatchRequest<T = any>(...url: string[]): Promise<T[]>;
    export function dynamicsBatchQuery<T = any>(...query: Query[]): Promise<T[]>;
}
declare module "Dynamics/Dynamics" {
    import { Query } from "Query/Query";
    import { DynamicsBatch } from "Dynamics/DynamicsBatch";
    export const WebApiVersion = "v9.1";
    export const DefaultMaxRecords = 100;
    export const DynamicsHeaders: {
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
}
declare module "tests/queryTests" {
    export function createQueryWithAllExpressions(): void;
}
