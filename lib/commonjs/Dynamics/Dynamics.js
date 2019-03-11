"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Query_1 = require("../Query/Query");
const DynamicsBatch_1 = require("./DynamicsBatch");
const DynamicsRequest_1 = require("./DynamicsRequest");
exports.WebApiVersion = 'v9.1';
exports.DefaultMaxRecords = 100;
exports.DynamicsHeaders = {
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
    'Prefer': 'odata.include-annotations=OData.Community.Display.V1.FormattedValue'
};
function dynamics(accessToken) {
    return new DynamicsClient(accessToken);
}
exports.default = dynamics;
class DynamicsClient {
    constructor(accessToken) {
        this.dynamicsHeaders = accessToken && {
            'Authorization': 'Bearer ' + accessToken
        };
    }
    batch() {
        return DynamicsBatch_1.dynamicsBatch(this.dynamicsHeaders);
    }
    fetch(query, maxRowCount = exports.DefaultMaxRecords) {
        return DynamicsRequest_1.dynamicsQuery(query, maxRowCount, this.dynamicsHeaders);
    }
    optionset(entityName, attributeName) {
        return DynamicsRequest_1.dynamicsRequest(`/api/data/${exports.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes(LogicalName='${attributeName}')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet($select=Options),GlobalOptionSet($select=Options)`, this.dynamicsHeaders)
            .then(attribute => (attribute.OptionSet || attribute.GlobalOptionSet).Options.map((option) => ({
            label: (option.Label && option.Label.UserLocalizedLabel && option.Label.UserLocalizedLabel.Label),
            value: option.Value
        })));
    }
    query(entityLogicalName, entitySetName) {
        return Query_1.default(entityLogicalName).path(entitySetName);
    }
    save(entitySetName, data, id) {
        return DynamicsRequest_1.dynamicsSave(entitySetName, data, id, this.dynamicsHeaders);
    }
}
