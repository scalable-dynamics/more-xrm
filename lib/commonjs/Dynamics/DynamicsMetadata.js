"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dynamics_1 = require("./Dynamics");
const DynamicsBatch_1 = require("./DynamicsBatch");
const DynamicsRequest_1 = require("./DynamicsRequest");
function dynamicsMetadata(accessToken) {
    return new DynamicsMetadataClient(accessToken);
}
exports.default = dynamicsMetadata;
function isLookupAttribute(attribute) {
    return attribute.Type === 'Lookup' && attribute['LookupEntityName'];
}
exports.isLookupAttribute = isLookupAttribute;
function isOptionSetAttribute(attribute) {
    return (attribute.Type === 'Picklist' || attribute.Type === 'State' || attribute.Type === 'Status') && attribute['PicklistOptions'];
}
exports.isOptionSetAttribute = isOptionSetAttribute;
const entityProperties = [
    "Description", "DisplayName", "EntitySetName",
    "IconSmallName", "IsActivity", "IsCustomEntity",
    "LogicalName", "PrimaryIdAttribute", "PrimaryNameAttribute"
];
const attributeProperties = [
    "AttributeType", "DisplayName", "IsCustomAttribute",
    "LogicalName", "SchemaName"
];
const ExcludedAttributeTypeFilters = [
    'Uniqueidentifier',
    'CalendarRules',
    'EntityName',
    'ManagedProperty',
    'Owner',
    'Virtual',
    'Lookup',
    'Picklist',
    'Status',
    'State'
];
const ExcludedAttributeNameFilters = [
    'exchangerate',
    'utcconversiontimezonecode',
    'timezoneruleversionnumber',
    'importsequencenumber',
    'organizationid',
    'transactioncurrencyid',
    'versionnumber',
    'createdonbehalfby',
    'modifiedonbehalfby',
    'overriddencreatedon',
    'entityimage_timestamp'
];
class DynamicsMetadataClient {
    constructor(accessToken) {
        this.dynamicsHeaders = accessToken && {
            'Authorization': 'Bearer ' + accessToken
        };
    }
    attributes(entityName) {
        return DynamicsBatch_1.dynamicsBatch(this.dynamicsHeaders)
            .requestAllUrls(this.getMetadataUrls(entityName, false))
            .execute()
            .then(data => this.flatten(data)
            .filter((attribute) => attribute.LogicalName.indexOf('yomi') === -1 || attribute.LogicalName.indexOf('base') != attribute.LogicalName.length - 4)
            .map(DynamicsMetadataMapper.MapAttribute));
    }
    entities() {
        return DynamicsRequest_1.dynamicsRequest(`/api/data/${Dynamics_1.WebApiVersion}/EntityDefinitions?$select=EntitySetName,Description,DisplayName,LogicalName,PrimaryIdAttribute,PrimaryNameAttribute,IconSmallName,IsActivity,IsCustomEntity`, this.dynamicsHeaders)
            .then(data => data
            .map(entity => DynamicsMetadataMapper.MapEntity(entity)));
    }
    entity(entityName) {
        return DynamicsRequest_1.dynamicsRequest(`/api/data/${Dynamics_1.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')?$select=EntitySetName,Description,DisplayName,LogicalName,PrimaryIdAttribute,PrimaryNameAttribute,IconSmallName,IsActivity,IsCustomEntity`, this.dynamicsHeaders)
            .then(entity => this.attributes(entityName)
            .then(attributes => DynamicsMetadataMapper.MapEntity(entity, attributes)));
    }
    entityAttributes(...entityNames) {
        return DynamicsBatch_1.dynamicsBatch(this.dynamicsHeaders)
            .requestAllUrls(this.flatten(entityNames.map(e => this.getMetadataUrls(e, true))))
            .execute()
            .then(data => {
            const entities = [];
            const items = this.flatten(data);
            let currentEntity;
            for (const item of items) {
                if (item.EntitySetName) {
                    currentEntity = DynamicsMetadataMapper.MapEntity(item);
                    entities.push(currentEntity);
                }
                else if (item.LogicalName.indexOf('yomi') == -1 && item.LogicalName.indexOf('base') != item.LogicalName.length - 4) {
                    currentEntity.Attributes.push(DynamicsMetadataMapper.MapAttribute(item));
                }
            }
            return entities;
        });
    }
    getMetadataUrls(entityName, includeEntity = false) {
        const attributeTypeFilter = ExcludedAttributeTypeFilters.map(v => `AttributeType ne Microsoft.Dynamics.CRM.AttributeTypeCode'${v}'`).join(' and ');
        const attributeNameFilter = ExcludedAttributeNameFilters.map(v => `LogicalName ne '${v}'`).join(' and ');
        return [
            `/api/data/${Dynamics_1.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')?$select=${entityProperties}`,
            `/api/data/${Dynamics_1.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes?$select=${attributeProperties}&$filter=${attributeTypeFilter} and ${attributeNameFilter}`,
            `/api/data/${Dynamics_1.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.LookupAttributeMetadata?$select=${attributeProperties},Targets`,
            `/api/data/${Dynamics_1.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=${attributeProperties}&$expand=OptionSet($select=Options)`,
            `/api/data/${Dynamics_1.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.StatusAttributeMetadata?$select=${attributeProperties}&$expand=OptionSet($select=Options)`,
            `/api/data/${Dynamics_1.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.StateAttributeMetadata?$select=${attributeProperties}&$expand=OptionSet($select=Options)`
        ].slice(includeEntity ? 0 : 1);
    }
    flatten(values) {
        return [].concat(...values);
    }
}
class DynamicsMetadataMapper {
    static MapAttribute(attribute) {
        return {
            LogicalName: attribute.LogicalName,
            DisplayName: (attribute.DisplayName && attribute.DisplayName.UserLocalizedLabel && attribute.DisplayName.UserLocalizedLabel.Label) || attribute.LogicalName,
            Type: attribute.AttributeType,
            IsCustomAttribute: attribute.IsCustomAttribute,
            LookupEntityName: isLookup(attribute) && attribute.Targets[0],
            LookupSchemaName: isLookup(attribute) && attribute.SchemaName,
            PicklistOptions: isOptionSet(attribute) && attribute.OptionSet.Options.map((opt) => ({
                Label: (opt.Label && opt.Label.UserLocalizedLabel && opt.Label.UserLocalizedLabel.Label),
                Value: opt.Value
            }))
        };
    }
    static MapEntity(entity, attributes) {
        return {
            Description: (entity.Description && entity.Description.UserLocalizedLabel && entity.Description.UserLocalizedLabel.Label) || '',
            DisplayName: (entity.DisplayName && entity.DisplayName.UserLocalizedLabel && entity.DisplayName.UserLocalizedLabel.Label) || entity.LogicalName,
            EntitySetName: entity.EntitySetName,
            IconSmallName: entity.IconSmallName,
            IsActivity: entity.IsActivity,
            IsCustomEntity: entity.IsCustomEntity,
            LogicalName: entity.LogicalName,
            PrimaryIdAttribute: entity.PrimaryIdAttribute,
            PrimaryNameAttribute: entity.PrimaryNameAttribute,
            Attributes: attributes || []
        };
    }
}
function isLookup(attribute) {
    return Array.isArray(attribute['Targets']);
}
function isOptionSet(attribute) {
    return attribute['OptionSet'] && Array.isArray(attribute['OptionSet'].Options);
}
