import query, { Query } from "../Query/Query";
import { dynamicsBatch, DynamicsBatch } from "./DynamicsBatch";
import { dynamicsQuery, dynamicsRequest, dynamicsSave } from "./DynamicsRequest";

export const WebApiVersion = 'v9.1';
export const DefaultMaxRecords = 100;
export const DynamicsHeaders = {
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
    'Prefer': 'odata.include-annotations=OData.Community.Display.V1.FormattedValue'
};

export interface Dynamics {
    batch(): DynamicsBatch;
    fetch<T>(query: Query, maxRowCount?: number): Promise<T[]>;
    optionset(entityName: any, attributeName: any): Promise<{ label: string, value: number }[]>;
    query(entityLogicalName: string, entitySetName: string): Query;
    save(entitySetName: string, data: any, id?: string): Promise<string>;
}

export default function dynamics(accessToken?: string): Dynamics {
    return new DynamicsClient(accessToken);
}

class DynamicsClient implements Dynamics {
    private dynamicsHeaders: any;

    constructor(accessToken?: string) {
        this.dynamicsHeaders = accessToken && {
            'Authorization': 'Bearer ' + accessToken
        }
    }

    batch(): DynamicsBatch {
        return dynamicsBatch(this.dynamicsHeaders);
    }

    fetch<T>(query: Query, maxRowCount: number = DefaultMaxRecords): Promise<T[]>
    {
        return dynamicsQuery<T>(query, maxRowCount, this.dynamicsHeaders);
    }

    optionset(entityName: any, attributeName: any): Promise<{ label: string, value: number }[]>
    {
        return dynamicsRequest<any>(`/api/data/${WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes(LogicalName='${attributeName}')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet($select=Options),GlobalOptionSet($select=Options)`, this.dynamicsHeaders)
        .then(attribute =>
            (attribute.OptionSet || attribute.GlobalOptionSet).Options.map(
                (option) => ({
                    label: (option.Label && option.Label.UserLocalizedLabel && option.Label.UserLocalizedLabel.Label),
                    value: option.Value
                })
            )
        );
    }

    query(entityLogicalName: string, entitySetName: string): Query
    {
        return query(entityLogicalName).path(entitySetName);
    }

    save(entitySetName: string, data: any, id?: string): Promise<string> {
        return dynamicsSave(entitySetName, data, id, this.dynamicsHeaders);
    }
}