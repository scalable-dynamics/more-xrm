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
export declare type QueryOperatorParam = QueryOperator | QueryOperatorExpression;
export declare enum QueryOperator {
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
export declare type QueryOperatorExpression = 'like' | 'not-like' | 'begins-with' | 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'not-in' | 'on-or-before' | 'on-or-after' | 'null' | 'not-null' | 'eq-userid' | 'ne-userid' | 'eq-userteams';
export default function query(entityName: string, ...attributeNames: string[]): Query;
export declare function GetRootQuery(query: Query): DataQuery;
