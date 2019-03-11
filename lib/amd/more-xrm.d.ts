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
    }
    export interface Query {
        alias(attributeName: string, alias: string): Query;
        path(entityPath: string): Query;
        select(...attributeNames: string[]): Query;
        where(attributeName: string, operator: QueryOperatorParam, ...values: any[]): Query;
        whereAny(any: (or: (attributeName: string, operator: QueryOperatorParam, ...values: any[]) => void) => void): Query;
        orderBy(attributeName: string, isDescendingOrder?: boolean): Query;
        join(entityName: string, fromAttribute: string, toAttribute?: string, alias?: string, isOuterJoin?: boolean): Query;
        Query: DataQuery;
    }
    export type QueryOperatorParam = QueryOperator | QueryOperatorExpression;
    export enum QueryOperator {
        Contains = "like",
        NotContains = "not-like",
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
    export type QueryOperatorExpression = 'like' | 'not-like' | 'begins-with' | 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'not-in' | 'on-or-before' | 'on-or-after' | 'null' | 'not-null' | 'eq-userid' | 'ne-userid' | 'eq-userteams';
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
        optionset(entityName: any, attributeName: any): Promise<{
            label: string;
            value: number;
        }[]>;
        query(entityLogicalName: string, entitySetName: string): Query;
        save(entitySetName: string, data: any, id?: string): Promise<string>;
    }
    export default function dynamics(accessToken?: string): Dynamics;
}
declare module "Dynamics/Model/EntityMetadata" {
    export interface EntityMetadata {
        Description?: string;
        DisplayName: string;
        EntitySetName: string;
        IconSmallName?: string;
        IsActivity?: boolean;
        IsCustomEntity?: boolean;
        LogicalName: string;
        PrimaryIdAttribute: string;
        PrimaryNameAttribute: string;
    }
}
declare module "Dynamics/Model/AttributeMetadata" {
    import { EntityMetadata } from "Dynamics/Model/EntityMetadata";
    export interface EntityAttributeMetadata extends EntityMetadata {
        Attributes: AttributeMetadata[];
    }
    export interface LookupAttributeMetadata extends AttributeMetadata {
        LookupAttributes?: AttributeMetadata[];
        LookupEntityName?: string;
        LookupSchemaName?: string;
    }
    export interface AttributeMetadata {
        LogicalName: string;
        DisplayName: string;
        Type: AttributeTypeCode;
        IsCustomAttribute?: boolean;
    }
    export type AttributeTypeCode = 'BigInt' | 'Boolean' | 'Customer' | 'DateTime' | 'Decimal' | 'Double' | 'Integer' | 'Lookup' | 'Memo' | 'Money' | 'PartyList' | 'Picklist' | 'State' | 'Status' | 'String';
    export const AttributeTypeCodes: string[];
}
declare module "Dynamics/Model/OptionSetMetadata" {
    import { AttributeMetadata } from "Dynamics/Model/AttributeMetadata";
    export interface OptionSetAttributeMetadata extends AttributeMetadata {
        PicklistOptions?: OptionSetMetadata[];
    }
    export interface OptionSetMetadata {
        Label: string;
        Value: number;
    }
}
declare module "Dynamics/DynamicsMetadata" {
    import { AttributeMetadata, EntityAttributeMetadata, LookupAttributeMetadata } from "Dynamics/Model/AttributeMetadata";
    import { EntityMetadata } from "Dynamics/Model/EntityMetadata";
    import { OptionSetAttributeMetadata, OptionSetMetadata } from "Dynamics/Model/OptionSetMetadata";
    export type DynamicsEntityMetadata = EntityAttributeMetadata;
    export type DynamicsAttributeMetadata = AnyAttributeMetadata;
    export type DynamicsOptionSetMetadata = OptionSetMetadata;
    export type DynamicsLookupAttributeMetadata = LookupAttributeMetadata;
    export type DynamicsOptionSetAttributeMetadata = OptionSetAttributeMetadata;
    export default function dynamicsMetadata(accessToken?: string): DynamicsMetadata;
    export function isLookupAttribute(attribute: DynamicsAttributeMetadata): attribute is DynamicsLookupAttributeMetadata;
    export function isOptionSetAttribute(attribute: DynamicsAttributeMetadata): attribute is DynamicsOptionSetAttributeMetadata;
    export interface DynamicsMetadata {
        attributes(entityName: string): Promise<AttributeMetadata[]>;
        entities(): Promise<EntityMetadata[]>;
        entity(entityName: string): Promise<EntityAttributeMetadata>;
        entityAttributes(...entityNames: string[]): Promise<EntityAttributeMetadata[]>;
    }
    type AnyAttributeMetadata = AttributeMetadata | LookupAttributeMetadata | OptionSetAttributeMetadata;
}
declare module "tests/dynamicsMetadataTests" {
    export function dynamicsMetadataRetrieveAll(): Promise<void>;
}
declare module "tests/dynamicsTests" {
    export function dynamicsTestAll(): Promise<void>;
}
declare module "tests/queryTests" {
    export function createQueryWithAllExpressions(): void;
}
