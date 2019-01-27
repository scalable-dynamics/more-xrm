import { dynamicsRequest } from "./DynamicsRequest";
import { dynamicsBatch } from "./DynamicsBatch";
import { WebApiVersion } from "./Dynamics";
export default function dynamicsMetadata(accessToken) {
    return new DynamicsMetadataClient(accessToken);
}
const ExcludedAttributeFilters = {
    'Uniqueidentifier': 'AttributeType',
    'CalendarRules': 'AttributeType',
    'EntityName': 'AttributeType',
    'ManagedProperty': 'AttributeType',
    'Owner': 'AttributeType',
    'Virtual': 'AttributeType',
    'Lookup': 'AttributeType',
    'Picklist': 'AttributeType',
    'Status': 'AttributeType',
    'State': 'AttributeType',
    'yomi': "contains(LogicalName,'yomi')",
    'base': "endswith(LogicalName,'base')"
};
class DynamicsMetadataClient {
    constructor(accessToken) {
        this.dynamicsHeaders = accessToken && {
            'Authorization': 'Bearer ' + accessToken
        };
    }
    attributes(entityName) {
        const properties = ["AttributeType", "DisplayName", "LogicalName", "SchemaName", "IsCustomAttribute"];
        const filter = Object.keys(ExcludedAttributeFilters).map(v => (ExcludedAttributeFilters[v] == 'AttributeType' && `AttributeType ne Microsoft.Dynamics.CRM.AttributeTypeCode'${v}'`) || v).join(' and ');
        return dynamicsBatch(this.dynamicsHeaders)
            .requestAllUrls([
            `/api/data/${WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes?$select=${properties}&$filter=${filter}`,
            `/api/data/${WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.LookupAttributeMetadata?$select=${properties},Targets`,
            `/api/data/${WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=${properties}&$expand=OptionSet($select=Options)`,
            `/api/data/${WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.StatusAttributeMetadata?$select=${properties}&$expand=OptionSet($select=Options)`,
            `/api/data/${WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.StateAttributeMetadata?$select=${properties}&$expand=OptionSet($select=Options)`
        ])
            .execute()
            .then(data => this.flatten(data)
            .map((attribute) => ({
            LogicalName: attribute.LogicalName,
            DisplayName: (attribute.DisplayName && attribute.DisplayName.UserLocalizedLabel && attribute.DisplayName.UserLocalizedLabel.Label) || attribute.LogicalName,
            Type: attribute.AttributeType,
            LookupEntityName: attribute.Targets && attribute.Targets[0],
            PicklistOptions: attribute.OptionSet && attribute.OptionSet.Options.map((opt) => ({
                Label: (opt.Label && opt.Label.UserLocalizedLabel && opt.Label.UserLocalizedLabel.Label),
                Value: opt.Value
            }))
        })));
    }
    entities() {
        return dynamicsRequest(`/api/data/${WebApiVersion}/EntityDefinitions?$select=EntitySetName,Description,DisplayName,LogicalName,PrimaryIdAttribute,PrimaryNameAttribute,IconSmallName,IsActivity,IsCustomEntity`, this.dynamicsHeaders)
            .then(data => data
            .map(entity => ({
            LogicalName: entity.LogicalName,
            EntitySetName: entity.EntitySetName,
            DisplayName: (entity.DisplayName && entity.DisplayName.UserLocalizedLabel && entity.DisplayName.UserLocalizedLabel.Label) || entity.LogicalName,
            Description: (entity.Description && entity.Description.UserLocalizedLabel && entity.Description.UserLocalizedLabel.Label) || ''
        })));
    }
    entity(entityName) {
        return dynamicsRequest(`/api/data/${WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')?$select=EntitySetName,Description,DisplayName,LogicalName,PrimaryIdAttribute,PrimaryNameAttribute,IconSmallName,IsActivity,IsCustomEntity`, this.dynamicsHeaders)
            .then(entity => this.attributes(entityName)
            .then(attributes => ({
            LogicalName: entity.LogicalName,
            EntitySetName: entity.EntitySetName,
            DisplayName: (entity.DisplayName && entity.DisplayName.UserLocalizedLabel && entity.DisplayName.UserLocalizedLabel.Label) || entity.LogicalName,
            Description: (entity.Description && entity.Description.UserLocalizedLabel && entity.Description.UserLocalizedLabel.Label) || '',
            Attributes: attributes
        })));
    }
    flatten(values) {
        return [].concat(...values);
    }
}
