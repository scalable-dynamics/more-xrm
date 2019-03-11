import query from "../Query/Query";
import { dynamicsBatch } from "./DynamicsBatch";
import { dynamicsQuery, dynamicsRequest, dynamicsSave } from "./DynamicsRequest";
export const WebApiVersion = 'v9.1';
export const DefaultMaxRecords = 100;
export const DynamicsHeaders = {
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
    'Prefer': 'odata.include-annotations=OData.Community.Display.V1.FormattedValue'
};
export default function dynamics(accessToken) {
    return new DynamicsClient(accessToken);
}
class DynamicsClient {
    constructor(accessToken) {
        this.dynamicsHeaders = accessToken && {
            'Authorization': 'Bearer ' + accessToken
        };
    }
    batch() {
        return dynamicsBatch(this.dynamicsHeaders);
    }
    fetch(query, maxRowCount = DefaultMaxRecords) {
        return dynamicsQuery(query, maxRowCount, this.dynamicsHeaders);
    }
    optionset(entityName, attributeName) {
        return dynamicsRequest(`/api/data/${WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes(LogicalName='${attributeName}')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet($select=Options),GlobalOptionSet($select=Options)`, this.dynamicsHeaders)
            .then(attribute => (attribute.OptionSet || attribute.GlobalOptionSet).Options.map((option) => ({
            label: (option.Label && option.Label.UserLocalizedLabel && option.Label.UserLocalizedLabel.Label),
            value: option.Value
        })));
    }
    query(entityLogicalName, entitySetName) {
        return query(entityLogicalName).path(entitySetName);
    }
    save(entitySetName, data, id) {
        return dynamicsSave(entitySetName, data, id, this.dynamicsHeaders);
    }
}
