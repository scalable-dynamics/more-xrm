# more-xrm

Create more applications using the Microsoft Dynamics Xrm platform. more-xrm enables querying the dynamics data model from any application.

## Example

`
export async function DynamicsClientSample() {
    const dynamicsClient = dynamics();

    const allAccounts = await dynamicsClient.batch()
                                            .requestAllUrls(['accounts'])
                                            .execute();

    await dynamicsClient.save('accounts', { name: 'test' }, allAccounts[0].accountid);

    const xrmAccounts = await dynamicsClient.fetch(
        query('account').path('accounts')
                        .where('name', QueryOperator.Contains, 'xrm')
                        .orderBy('name')
                        .select('name')
    );

    return <Grid data={xrmAccounts} />;
}
`

## Interfaces

`
export interface Dynamics {
    batch(): DynamicsBatch;
    fetch<T>(query: Query, maxRowCount?: number): Promise<T[]>;
    save(entitySetName: string, data: any, id?: string): Promise<string>;
}

export interface DynamicsBatch {
    execute(): Promise<any[]>;
    request(query: Query, maxRowCount?: number): DynamicsBatch;
    requestAll(queries: Query[]): DynamicsBatch;
    requestAllUrls(urls: string[]): DynamicsBatch;
    saveEntity(entitySetName: string, data: any, id?: string): DynamicsBatch & {
        createRelatedEntity(entitySetName: string, data: any, navigationPropertyName: string): void
    };
}

export interface Query {
    alias(attributeName: string, alias: string): Query;
    path(entityPath: string): Query;
    select(...attributeNames: string[]): Query;
    where(attributeName: string, operator: QueryOperator, ...values: any[]): Query;
    whereAny(any: (or: (attributeName: string, operator: QueryOperator, ...values: any[]) => void) => void): Query;
    orderBy(attributeName: string, isDescendingOrder?: boolean): Query;
    join(entityName: string, fromAttribute: string, toAttribute?: string, alias?: string, isOuterJoin?: boolean): Query;
}
`

## Functions

`
function dynamics(accessToken?: string): Dynamics

function dynamicsQuery<T>(query: Query, maxRowCount?: number, headers?: any): Promise<T[]>;
function dynamicsQueryUrl<T>(dynamicsEntitySetUrl: string, query: Query, maxRowCount?: number, headers?: any): Promise<T[]>;
function dynamicsRequest<T>(dynamicsEntitySetUrl: string, headers?: any): Promise<T>;
function dynamicsSave(entitySetName: string, data: any, id?: string, headers?: any): Promise<string>;

function dynamicsBatch(headers?: any): DynamicsBatch;
function dynamicsBatchRequest<T = any>(...url: string[]): Promise<T[]>;
function dynamicsBatchQuery<T = any>(...query: Query[]): Promise<T[]>;

function query(entityName: string, ...attributeNames: string[]): Query;
function GetQueryXml(query: Query, maxRowCount?: number, format?: boolean): string;
`