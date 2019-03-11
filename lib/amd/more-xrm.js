var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define("Query/Query", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var QueryOperator;
    (function (QueryOperator) {
        QueryOperator["Contains"] = "like";
        QueryOperator["NotContains"] = "not-like";
        QueryOperator["StartsWith"] = "begins-with";
        QueryOperator["Equals"] = "eq";
        QueryOperator["NotEquals"] = "neq";
        QueryOperator["GreaterThan"] = "gt";
        QueryOperator["LessThan"] = "lt";
        QueryOperator["In"] = "in";
        QueryOperator["NotIn"] = "not-in";
        QueryOperator["OnOrBefore"] = "on-or-before";
        QueryOperator["OnOrAfter"] = "on-or-after";
        QueryOperator["Null"] = "null";
        QueryOperator["NotNull"] = "not-null";
        QueryOperator["IsCurrentUser"] = "eq-userid";
        QueryOperator["IsNotCurrentUser"] = "ne-userid";
        QueryOperator["IsCurrentUserTeam"] = "eq-userteams";
    })(QueryOperator = exports.QueryOperator || (exports.QueryOperator = {}));
    function query(entityName, ...attributeNames) {
        return new QueryProvider(entityName).select(...attributeNames);
    }
    exports.default = query;
    function GetRootQuery(query) {
        return (query['RootQuery'] || query).Query;
    }
    exports.GetRootQuery = GetRootQuery;
    class QueryProvider {
        constructor(EntityName) {
            this.EntityName = EntityName;
            this.Query = {
                Alias: { EntityName },
                EntityName: EntityName,
                Attributes: new Set(),
                OrderBy: new Set(),
                Conditions: [],
                Joins: []
            };
        }
        alias(attributeName, alias) {
            this.Query.Alias[attributeName] = alias;
            return this;
        }
        path(entityPath) {
            this.Query.EntityPath = entityPath;
            return this;
        }
        select(...attributeNames) {
            for (const a of this.flatten(attributeNames)) {
                this.Query.Attributes.add(a);
            }
            if (this.RootQuery) {
                const rootQuery = GetRootQuery(this);
                for (const a of this.flatten(attributeNames)) {
                    rootQuery.Attributes.add(this.EntityName + '.' + a);
                }
            }
            return this;
        }
        where(attributeName, operator, ...values) {
            this.Query.Conditions.push({
                AttributeName: attributeName,
                Operator: operator,
                Values: this.flatten(values)
            });
            return this;
        }
        whereAny(any) {
            var conditions = [];
            any((attributeName, operator, ...values) => {
                conditions.push({
                    AttributeName: attributeName,
                    Operator: operator,
                    Values: this.flatten(values)
                });
            });
            this.Query.Conditions.push(conditions);
            return this;
        }
        orderBy(attributeName, isDescendingOrder) {
            if (isDescendingOrder) {
                this.Query.OrderBy.add('_' + attributeName);
            }
            else {
                this.Query.OrderBy.add(attributeName);
            }
            return this;
        }
        join(entityName, fromAttribute, toAttribute, alias, isOuterJoin) {
            var exp = new QueryProvider(entityName);
            var join = exp.Query;
            exp.RootQuery = this.RootQuery || this;
            join.JoinAlias = alias || entityName;
            join.JoinFromAttributeName = fromAttribute;
            join.JoinToAttributeName = toAttribute || this.EntityName + 'id';
            join.IsOuterJoin = isOuterJoin;
            this.Query.Joins.push(join);
            return exp;
        }
        flatten(values) {
            return [].concat(...values);
        }
    }
});
define("Query/QueryXml", ["require", "exports", "Query/Query"], function (require, exports, Query_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function GetQueryXml(query, maxRowCount = 0, format = false) {
        const dataQuery = Query_1.GetRootQuery(query);
        if (format) {
            return formatXml(GetDataQueryXml(dataQuery, maxRowCount));
        }
        else {
            return GetDataQueryXml(dataQuery, maxRowCount);
        }
    }
    exports.default = GetQueryXml;
    function GetDataQueryXml(query, maxRowCount) {
        var xml = [];
        xml.push('<fetch mapping="logical"');
        if (maxRowCount > 0) {
            xml.push(` count="${maxRowCount}"`);
        }
        xml.push('>');
        xml.push(`<entity name="${query.EntityName}" >`);
        xml.push(getQueryXml(query));
        xml.push('</entity>');
        xml.push('</fetch>');
        return xml.join('');
    }
    function getQueryXml(query) {
        const xml = [];
        query.Attributes.forEach(attribute => {
            if (query.Alias[attribute]) {
                xml.push(`<attribute name="${attribute}" alias="${query.Alias[attribute]}" />`);
            }
            else {
                xml.push(`<attribute name="${attribute}" />`);
            }
        });
        query.OrderBy.forEach(attribute => {
            if (attribute.indexOf('_') == 0) {
                xml.push(`<order attribute="${attribute.slice(1)}" descending="true" />`);
            }
            else {
                xml.push(`<order attribute="${attribute}" />`);
            }
        });
        if (query.Conditions.length > 0) {
            var hasOrCondition = false;
            var filters = [];
            filters.push('<filter type="and">');
            for (var filter of query.Conditions) {
                if (filter && filter.hasOwnProperty('length')) {
                    hasOrCondition = true;
                    var conditions = filter;
                    filters.push('</filter>');
                    filters.push('<filter type="or">');
                    for (var condition of conditions) {
                        filters.push(getConditionXml(condition));
                    }
                    filters.push('</filter>');
                    filters.push('<filter type="and">');
                }
                else {
                    filters.push(getConditionXml(filter));
                }
            }
            filters.push('</filter>');
            if (hasOrCondition) {
                filters.unshift('<filter type="and">');
                filters.push('</filter>');
            }
            var skipNextFilter;
            for (var i = 0; i < filters.length; i++) {
                if (filters[i] && filters[i + 1] && filters[i].indexOf('<filter') > -1 && filters[i + 1].indexOf('/filter>') > -1) {
                    skipNextFilter = true;
                }
                else if (!skipNextFilter) {
                    xml.push(filters[i]);
                }
                else {
                    skipNextFilter = false;
                }
            }
        }
        if (query.Joins) {
            for (var join of query.Joins) {
                xml.push(`<link-entity name="${join.EntityName}" alias="${join.JoinAlias}" from="${join.JoinFromAttributeName}" to="${join.JoinToAttributeName}" link-type="${join.IsOuterJoin ? 'outer' : 'inner'}">`);
                xml.push(getQueryXml(join));
                xml.push('</link-entity>');
            }
        }
        return xml.join('\n');
    }
    function getConditionXml(condition) {
        var xml = [];
        if (condition.AttributeName.indexOf('.') > -1) {
            condition.AttributeName = `${condition.AttributeName.split('.')[1]}" entityname="${condition.AttributeName.split('.')[0]}`;
        }
        if (condition.Values && condition.Values.length > 0) {
            if (condition.Values.length > 1) {
                xml.push(`<condition attribute="${condition.AttributeName}" operator="${condition.Operator}">`);
                for (var value of condition.Values) {
                    xml.push(`<value>${encodeValue(value)}</value>`);
                }
                xml.push('</condition>');
            }
            else {
                xml.push(`<condition attribute="${condition.AttributeName}" operator="${condition.Operator}" value="${encodeValue(condition.Values[0])}" />`);
            }
        }
        else {
            xml.push(`<condition attribute="${condition.AttributeName}" operator="${condition.Operator}" />`);
        }
        return xml.join('\n');
    }
    function encodeValue(value) {
        if (value === 0)
            return '0';
        if (value === true)
            return 'true';
        if (value === false)
            return 'false';
        if (!value)
            return '';
        if (typeof (value.toISOString) === 'function')
            return value.toISOString();
        return xmlEncode(value.toString());
    }
    function xmlEncode(text) {
        if (text && typeof (text) === 'string') {
            text = text.replace(/&/g, '&amp;');
            text = text.replace(/\"/g, '&quot;');
            text = text.replace(/\'/g, '&apos;');
            text = text.replace(/</g, '&lt;');
            text = text.replace(/>/g, '&gt;');
        }
        return text;
    }
    function formatXml(xmlString) {
        var indent = "\t";
        var tabs = ""; //store the current indentation
        return xmlString.replace(/\s*<[^>\/]*>[^<>]*<\/[^>]*>|\s*<.+?>|\s*[^<]+/g, //pattern to match nodes (angled brackets or text)
        function (m, i) {
            m = m.replace(/^\s+|\s+$/g, ""); //trim the match just in case
            if (i < 38 && /^<[?]xml/.test(m))
                return m + "\n"; //if the match is a header, ignore it
            if (/^<[/]/.test(m)) //if the match is a closing tag
             {
                tabs = tabs.replace(indent, ""); //remove one indent from the store
                m = tabs + m; //add the tabs at the beginning of the match
            }
            else if (/<.*>.*<\/.*>|<.*[^>]\/>/.test(m)) //if the match contains an entire node
             {
                //leave the store as is or
                m = m.replace(/(<[^\/>]*)><[\/][^>]*>/g, "$1 />"); //join opening with closing tags of the same node to one entire node if no content is between them
                m = tabs + m; //add the tabs at the beginning of the match
            }
            else if (/<.*>/.test(m)) //if the match starts with an opening tag and does not contain an entire node
             {
                m = tabs + m; //add the tabs at the beginning of the match
                tabs += indent; //and add one indent to the store
            }
            else //if the match contain a text node
             {
                m = tabs + m; // add the tabs at the beginning of the match
            }
            //return m+"\n";
            return "\n" + m; //content has additional space(match) from header
        });
    }
});
define("Dynamics/DynamicsRequest", ["require", "exports", "Query/Query", "Query/QueryXml", "Dynamics/Dynamics"], function (require, exports, Query_2, QueryXml_1, Dynamics_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function dynamicsQuery(query, maxRowCount, headers) {
        const dataQuery = Query_2.GetRootQuery(query);
        if (!dataQuery.EntityPath) {
            throw new Error('dynamicsQuery requires a Query object with an EntityPath');
        }
        return dynamicsQueryUrl(`/api/data/${Dynamics_1.WebApiVersion}/${dataQuery.EntityPath}`, query, maxRowCount, headers);
    }
    exports.dynamicsQuery = dynamicsQuery;
    function dynamicsQueryUrl(dynamicsEntitySetUrl, query, maxRowCount, headers) {
        const querySeparator = (dynamicsEntitySetUrl.indexOf('?') > -1 ? '&' : '?');
        return request(`${dynamicsEntitySetUrl}${querySeparator}fetchXml=${escape(QueryXml_1.default(query, maxRowCount))}`, 'GET', undefined, headers);
    }
    exports.dynamicsQueryUrl = dynamicsQueryUrl;
    function dynamicsRequest(dynamicsEntitySetUrl, headers) {
        return request(dynamicsEntitySetUrl, 'GET', undefined, headers);
    }
    exports.dynamicsRequest = dynamicsRequest;
    function dynamicsSave(entitySetName, data, id, headers) {
        if (id) {
            return request(`/api/data/${Dynamics_1.WebApiVersion}/${entitySetName}(${trimId(id)})`, 'PATCH', data, headers);
        }
        else {
            return request(`/api/data/${Dynamics_1.WebApiVersion}/${entitySetName}()`, 'POST', data, headers);
        }
    }
    exports.dynamicsSave = dynamicsSave;
    function formatDynamicsResponse(data) {
        var items = [];
        if (data && data.error) {
            throw new Error(data.error);
        }
        if (data && data.value) {
            data = data.value;
        }
        if (!Array.isArray(data)) {
            return formatDynamicsResponse([data])[0];
        }
        if (data) {
            for (var item of data) {
                var row = {};
                for (var key in item) {
                    var name = key;
                    if (name.indexOf('@odata') == 0) {
                        continue;
                    }
                    if (name.indexOf('transactioncurrencyid') > -1) {
                        continue;
                    }
                    if (name.indexOf('@') > -1) {
                        name = name.substring(0, name.indexOf('@'));
                        if (name.indexOf('_') == 0) {
                            name = name.slice(1, -6);
                        }
                        name += "_formatted";
                    }
                    else if (name.indexOf('_') == 0) {
                        name = name.slice(1, -6);
                    }
                    if (name.indexOf('_x002e_') > -1) {
                        var obj = name.substring(0, name.indexOf('_x002e_'));
                        name = name.substring(name.indexOf('_x002e_') + 7);
                        if (!row[obj]) {
                            row[obj] = {};
                        }
                        row[obj][name] = item[key];
                    }
                    else {
                        row[name] = item[key];
                    }
                }
                items.push(row);
            }
        }
        return items;
    }
    exports.formatDynamicsResponse = formatDynamicsResponse;
    function request(url, method, body, headers) {
        return fetch(url, {
            method: method,
            headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, Dynamics_1.DynamicsHeaders, headers),
            body: body
        })
            .then(response => response.json())
            .then(data => formatDynamicsResponse(data));
    }
    function trimId(id) {
        return (id || '').replace(/{|}/g, '');
    }
});
define("Dynamics/DynamicsBatch", ["require", "exports", "Query/Query", "Query/QueryXml", "Dynamics/Dynamics", "Dynamics/DynamicsRequest"], function (require, exports, Query_3, QueryXml_2, Dynamics_2, DynamicsRequest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function dynamicsBatch(headers) {
        return new Batch(headers);
    }
    exports.dynamicsBatch = dynamicsBatch;
    function dynamicsBatchRequest(...url) {
        const batch = new Batch();
        batch.requestAllUrls(url);
        return batch.execute();
    }
    exports.dynamicsBatchRequest = dynamicsBatchRequest;
    function dynamicsBatchQuery(...query) {
        const batch = new Batch();
        batch.requestAll(query);
        return batch.execute();
    }
    exports.dynamicsBatchQuery = dynamicsBatchQuery;
    class Batch {
        constructor(headers) {
            this.headers = headers;
            this.Changes = [];
            this.RelatedChanges = [];
        }
        execute() {
            return __awaiter(this, void 0, void 0, function* () {
                const results = yield Batch.requestBatch(`/api/data/${Dynamics_2.WebApiVersion}/$batch`, this.Changes, this.headers);
                if (this.RelatedChanges.length > 0) {
                    for (let change of this.RelatedChanges) {
                        let changeIndex = this.Changes.indexOf(change.relatedChange);
                        let relatedId = results[changeIndex];
                        change.entityData[`${change.relatedPropertyName}@odata.bind`] = `${change.relatedChange.entitySetName}(${Batch.trimId(relatedId)})`;
                    }
                    const related = yield Batch.requestBatch(`/api/data/${Dynamics_2.WebApiVersion}/$batch`, this.RelatedChanges, this.headers);
                    return results.concat(related);
                }
                else {
                    return results;
                }
            });
        }
        requestAllUrls(urls) {
            this.Changes.push.apply(this.Changes, urls.map(entitySetQuery => ({ entitySetQuery })));
            return this;
        }
        requestAll(queries) {
            this.Changes.push.apply(queries.map(query => {
                const dataQuery = Query_3.GetRootQuery(query);
                this.request(query);
                return {
                    entitySetName: dataQuery.EntityPath,
                    entitySetQuery: `fetchXml=${escape(QueryXml_2.default(query))}`
                };
            }));
            return this;
        }
        request(query, maxRowCount = Dynamics_2.DefaultMaxRecords) {
            const dataQuery = Query_3.GetRootQuery(query);
            if (!dataQuery.EntityPath) {
                throw new Error('dynamicsBatch request requires a Query object with an EntityPath');
            }
            this.Changes.push({
                entitySetName: dataQuery.EntityPath,
                entitySetQuery: `fetchXml=${escape(QueryXml_2.default(query, maxRowCount))}`
            });
            return this;
        }
        deleteEntity(entitySetName, id) {
            this.Changes.push({
                entitySetName: entitySetName,
                entityId: id,
                entityData: 'DELETE'
            });
            return this;
        }
        saveEntity(entitySetName, data, id) {
            this.Changes.push({
                entitySetName: entitySetName,
                entityId: id,
                entityData: data
            });
            return this;
        }
        createRelatedEntity(entitySetName, data, navigationPropertyName) {
            let lastChange = this.Changes[this.Changes.length - 1];
            if (!lastChange || lastChange.entityData == 'DELETE')
                throw new Error('createRelatedEntity relies on the previous change which was not found in the batch.');
            if (lastChange.entityId) {
                data[`${navigationPropertyName}@odata.bind`] = `${lastChange.entitySetName}(${lastChange.entityId})`;
                this.Changes.push({
                    entitySetName: entitySetName,
                    entityData: data
                });
            }
            else {
                this.RelatedChanges.push({
                    entitySetName: entitySetName,
                    entityData: data,
                    relatedChange: lastChange,
                    relatedPropertyName: navigationPropertyName
                });
            }
        }
        static requestBatch(url, requests, headers) {
            const batchId = Batch.createId();
            return fetch(url, {
                method: 'POST',
                headers: Object.assign({ 'Content-Type': `multipart/mixed;boundary=batch_${batchId}` }, Dynamics_2.DynamicsHeaders, headers),
                body: Batch.formatBatchRequest(batchId, requests)
            })
                .then(response => Batch.formatBatchResponse(response.text()));
        }
        static formatBatchRequest(batchId, changes) {
            let batchBody = [];
            let requestBody = [];
            let changeNumber = 1;
            let changesetId = Batch.createId();
            batchBody.push(`--batch_${batchId}`);
            batchBody.push(`Content-Type: multipart/mixed;boundary=changeset_${changesetId}`);
            batchBody.push('');
            for (let change of changes) {
                if (change.entitySetQuery) {
                    requestBody.push(`--batch_${batchId}`);
                    requestBody.push('Content-Type: application/http');
                    requestBody.push('Content-Transfer-Encoding:binary');
                    requestBody.push('');
                    if (change.entitySetName) {
                        requestBody.push(`GET ${encodeURI(`/api/data/${Dynamics_2.WebApiVersion}/${change.entitySetName}?${change.entitySetQuery}`)} HTTP/1.1`);
                    }
                    else {
                        requestBody.push(`GET ${encodeURI(change.entitySetQuery)} HTTP/1.1`);
                    }
                    requestBody.push('Accept: application/json');
                    requestBody.push('Prefer: odata.include-annotations="OData.Community.Display.V1.FormattedValue"');
                    requestBody.push('');
                }
                else {
                    batchBody.push(`--changeset_${changesetId}`);
                    batchBody.push('Content-Type: application/http');
                    batchBody.push('Content-Transfer-Encoding:binary');
                    batchBody.push(`Content-ID: ${changeNumber++}`);
                    batchBody.push('');
                    batchBody.push(`${change.entityId ? 'PATCH' : 'POST'} ${encodeURI(`/api/data/${Dynamics_2.WebApiVersion}/${change.entitySetName}(${Batch.trimId(change.entityId)})`)} HTTP/1.1`);
                    batchBody.push('Content-Type: application/json;type=entry');
                    batchBody.push('');
                    batchBody.push(JSON.stringify(change.entityData));
                }
            }
            batchBody.push(`--changeset_${changesetId}--`);
            batchBody.push(requestBody.join('\n'));
            batchBody.push(`--batch_${batchId}--`);
            return batchBody.join('\n');
        }
        static formatBatchResponse(responseText) {
            return responseText.then(response => {
                if (response) {
                    if (response.indexOf('"innererror"') > -1
                        || response.indexOf('HTTP/1.1 500 Internal Server Error') > -1
                        || response.indexOf('HTTP/1.1 400 Bad Request') > -1) {
                        throw new Error('Batch Request Error: ' + response);
                    }
                    else {
                        let data = [];
                        let responses = response.split('--changesetresponse');
                        for (let response of responses) {
                            let contentId = ((/Content-ID:\s?(.*)\b/g).exec(response) || []).slice(1)[0];
                            let entityId = ((/OData-EntityId:[^(]*\((.*)\)/g).exec(response) || []).slice(1)[0];
                            data[contentId - 1] = entityId;
                        }
                        let requests = response.split('--batchresponse');
                        for (let request of requests) {
                            //TODO: determine better way of identifying request responses
                            if (request.indexOf('OData.Community.Display.V1.FormattedValue') > -1) {
                                let responseIndex = request.indexOf('{');
                                let json = request.substring(responseIndex);
                                let item = JSON.parse(json);
                                data.push(DynamicsRequest_1.formatDynamicsResponse(item));
                            }
                        }
                        return data;
                    }
                }
            });
        }
        static createId() {
            return 'id' + Math.random().toString(16).slice(2);
        }
        static trimId(id) {
            return (id || '').replace(/{|}/g, '');
        }
    }
});
define("Dynamics/Dynamics", ["require", "exports", "Query/Query", "Dynamics/DynamicsBatch", "Dynamics/DynamicsRequest"], function (require, exports, Query_4, DynamicsBatch_1, DynamicsRequest_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
            return DynamicsRequest_2.dynamicsQuery(query, maxRowCount, this.dynamicsHeaders);
        }
        optionset(entityName, attributeName) {
            return DynamicsRequest_2.dynamicsRequest(`/api/data/${exports.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes(LogicalName='${attributeName}')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet($select=Options),GlobalOptionSet($select=Options)`, this.dynamicsHeaders)
                .then(attribute => (attribute.OptionSet || attribute.GlobalOptionSet).Options.map((option) => ({
                label: (option.Label && option.Label.UserLocalizedLabel && option.Label.UserLocalizedLabel.Label),
                value: option.Value
            })));
        }
        query(entityLogicalName, entitySetName) {
            return Query_4.default(entityLogicalName).path(entitySetName);
        }
        save(entitySetName, data, id) {
            return DynamicsRequest_2.dynamicsSave(entitySetName, data, id, this.dynamicsHeaders);
        }
    }
});
define("Dynamics/Model/EntityMetadata", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("Dynamics/Model/AttributeMetadata", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AttributeTypeCodes = [
        'BigInt',
        'Boolean',
        'Customer',
        'DateTime',
        'Decimal',
        'Double',
        'Integer',
        'Lookup',
        'Memo',
        'Money',
        'PartyList',
        'Picklist',
        'State',
        'Status',
        'String'
    ];
});
define("Dynamics/Model/OptionSetMetadata", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("Dynamics/DynamicsMetadata", ["require", "exports", "Dynamics/Dynamics", "Dynamics/DynamicsBatch", "Dynamics/DynamicsRequest"], function (require, exports, Dynamics_3, DynamicsBatch_2, DynamicsRequest_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
            return DynamicsBatch_2.dynamicsBatch(this.dynamicsHeaders)
                .requestAllUrls(this.getMetadataUrls(entityName, false))
                .execute()
                .then(data => this.flatten(data)
                .filter((attribute) => attribute.LogicalName.indexOf('yomi') === -1 || attribute.LogicalName.indexOf('base') != attribute.LogicalName.length - 4)
                .map(DynamicsMetadataMapper.MapAttribute));
        }
        entities() {
            return DynamicsRequest_3.dynamicsRequest(`/api/data/${Dynamics_3.WebApiVersion}/EntityDefinitions?$select=EntitySetName,Description,DisplayName,LogicalName,PrimaryIdAttribute,PrimaryNameAttribute,IconSmallName,IsActivity,IsCustomEntity`, this.dynamicsHeaders)
                .then(data => data
                .map(entity => DynamicsMetadataMapper.MapEntity(entity)));
        }
        entity(entityName) {
            return DynamicsRequest_3.dynamicsRequest(`/api/data/${Dynamics_3.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')?$select=EntitySetName,Description,DisplayName,LogicalName,PrimaryIdAttribute,PrimaryNameAttribute,IconSmallName,IsActivity,IsCustomEntity`, this.dynamicsHeaders)
                .then(entity => this.attributes(entityName)
                .then(attributes => DynamicsMetadataMapper.MapEntity(entity, attributes)));
        }
        entityAttributes(...entityNames) {
            return DynamicsBatch_2.dynamicsBatch(this.dynamicsHeaders)
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
                `/api/data/${Dynamics_3.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')?$select=${entityProperties}`,
                `/api/data/${Dynamics_3.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes?$select=${attributeProperties}&$filter=${attributeTypeFilter} and ${attributeNameFilter}`,
                `/api/data/${Dynamics_3.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.LookupAttributeMetadata?$select=${attributeProperties},Targets`,
                `/api/data/${Dynamics_3.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=${attributeProperties}&$expand=OptionSet($select=Options)`,
                `/api/data/${Dynamics_3.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.StatusAttributeMetadata?$select=${attributeProperties}&$expand=OptionSet($select=Options)`,
                `/api/data/${Dynamics_3.WebApiVersion}/EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.StateAttributeMetadata?$select=${attributeProperties}&$expand=OptionSet($select=Options)`
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
});
define("tests/dynamicsMetadataTests", ["require", "exports", "Dynamics/DynamicsMetadata"], function (require, exports, DynamicsMetadata_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function dynamicsMetadataRetrieveAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const meta = DynamicsMetadata_1.default();
            const entities = yield meta.entities();
            const findAccount = entities.filter(e => e.LogicalName === 'account')[0];
            const accountEntity = yield meta.entity('account');
            const matchingAccount = findAccount.DisplayName === accountEntity.DisplayName;
            if (!matchingAccount) {
                throw new Error('Account metadata was not found!');
            }
            const attributes = yield meta.attributes('account');
            const findAccountName = attributes.filter(a => a.LogicalName === 'name')[0];
            if (!findAccountName) {
                throw new Error('Account name attribute was not found!');
            }
        });
    }
    exports.dynamicsMetadataRetrieveAll = dynamicsMetadataRetrieveAll;
});
define("tests/dynamicsTests", ["require", "exports", "Dynamics/Dynamics", "Query/Query"], function (require, exports, Dynamics_4, Query_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function dynamicsTestAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const dyn = Dynamics_4.default();
            /* Batch Request */
            const allAccounts = yield dyn.batch()
                .requestAllUrls(['/api/data/v9.1/accounts'])
                .execute();
            if (allAccounts.length == 0) {
                throw new Error('No Accounts found!');
            }
            /* Create Entity */
            const id = yield dyn.save('accounts', { name: 'xrmtest1' });
            if (!id) {
                throw new Error('Account could not be created!');
            }
            /* Update Entity */
            const uid = yield dyn.save('accounts', { name: 'xrmtest2' }, id);
            if (id !== uid) {
                throw new Error('Account could not be updated!');
            }
            /* Fetch Query */
            const xrmAccount = yield dyn.fetch(dyn.query('account', 'accounts')
                .where('name', Query_5.QueryOperator.StartsWith, 'xrm')
                .orderBy('name')
                .select('name'))[0];
            if (!xrmAccount) {
                throw new Error('Account could not be found!');
            }
            /* Optionset Items */
            const statusOptions = yield dyn.optionset('account', 'statuscode');
            if (statusOptions.length == 0) {
                throw new Error('Optionset items could not be found!');
            }
        });
    }
    exports.dynamicsTestAll = dynamicsTestAll;
});
define("tests/queryTests", ["require", "exports", "Query/Query", "Query/QueryXml"], function (require, exports, Query_6, QueryXml_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createQueryWithAllExpressions() {
        const thisQuery = Query_6.default('account');
        thisQuery
            .select('accountid', 'name')
            .alias('accountid', 'Id')
            .orderBy('name')
            .orderBy('accountid', true)
            .path('accounts')
            .where('name', Query_6.QueryOperator.Contains, 'abc')
            .where('accountnumber', Query_6.QueryOperator.In, 1, 2, 3, 4)
            .whereAny(or => {
            or('name', Query_6.QueryOperator.Equals, 'a');
            or('name', Query_6.QueryOperator.Equals, 'b');
            or('name', Query_6.QueryOperator.Equals, 'c');
        })
            .join('contact', 'customerid');
        const fetchXml = QueryXml_3.default(thisQuery, 999, true);
        if (!fetchXml) {
            throw new Error('QueryXml could not be generated!');
        }
    }
    exports.createQueryWithAllExpressions = createQueryWithAllExpressions;
});
