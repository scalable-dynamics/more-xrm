var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
System.register("Query/Query", [], function (exports_1, context_1) {
    "use strict";
    var QueryOperator, QueryProvider;
    var __moduleName = context_1 && context_1.id;
    function query(entityName) {
        var attributeNames = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            attributeNames[_i - 1] = arguments[_i];
        }
        var _a;
        return (_a = new QueryProvider(entityName)).select.apply(_a, attributeNames);
    }
    exports_1("default", query);
    function GetRootQuery(query) {
        return (query['RootQuery'] || query).Query;
    }
    exports_1("GetRootQuery", GetRootQuery);
    return {
        setters: [],
        execute: function () {
            (function (QueryOperator) {
                QueryOperator["Contains"] = "like";
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
            })(QueryOperator || (QueryOperator = {}));
            exports_1("QueryOperator", QueryOperator);
            QueryProvider = /** @class */ (function () {
                function QueryProvider(EntityName) {
                    this.EntityName = EntityName;
                    this.Query = {
                        Alias: { EntityName: EntityName },
                        EntityName: EntityName,
                        Attributes: new Set(),
                        OrderBy: new Set(),
                        Conditions: [],
                        Joins: []
                    };
                }
                QueryProvider.prototype.alias = function (attributeName, alias) {
                    this.Query.Alias[attributeName] = alias;
                    return this;
                };
                QueryProvider.prototype.path = function (entityPath) {
                    this.Query.EntityPath = entityPath;
                    return this;
                };
                QueryProvider.prototype.select = function () {
                    var attributeNames = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        attributeNames[_i] = arguments[_i];
                    }
                    for (var _a = 0, _b = this.flatten(attributeNames); _a < _b.length; _a++) {
                        var a = _b[_a];
                        this.Query.Attributes.add(a);
                    }
                    if (this.RootQuery) {
                        var rootQuery = GetRootQuery(this);
                        for (var _c = 0, _d = this.flatten(attributeNames); _c < _d.length; _c++) {
                            var a = _d[_c];
                            rootQuery.Attributes.add(this.EntityName + '.' + a);
                        }
                    }
                    return this;
                };
                QueryProvider.prototype.where = function (attributeName, operator) {
                    var values = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        values[_i - 2] = arguments[_i];
                    }
                    this.Query.Conditions.push({
                        AttributeName: attributeName,
                        Operator: operator,
                        Values: this.flatten(values)
                    });
                    return this;
                };
                QueryProvider.prototype.whereAny = function (any) {
                    var _this = this;
                    var conditions = [];
                    any(function (attributeName, operator) {
                        var values = [];
                        for (var _i = 2; _i < arguments.length; _i++) {
                            values[_i - 2] = arguments[_i];
                        }
                        conditions.push({
                            AttributeName: attributeName,
                            Operator: operator,
                            Values: _this.flatten(values)
                        });
                    });
                    this.Query.Conditions.push(conditions);
                    return this;
                };
                QueryProvider.prototype.orderBy = function (attributeName, isDescendingOrder) {
                    if (isDescendingOrder) {
                        this.Query.OrderBy.add('_' + attributeName);
                    }
                    else {
                        this.Query.OrderBy.add(attributeName);
                    }
                    return this;
                };
                QueryProvider.prototype.join = function (entityName, fromAttribute, toAttribute, alias, isOuterJoin) {
                    var exp = new QueryProvider(entityName);
                    var join = exp.Query;
                    join.RootQuery = this.RootQuery || this;
                    join.JoinAlias = alias || entityName;
                    join.JoinFromAttributeName = fromAttribute;
                    join.JoinToAttributeName = toAttribute || this.EntityName + 'id';
                    join.IsOuterJoin = isOuterJoin;
                    this.Query.Joins.push(join);
                    return exp;
                };
                QueryProvider.prototype.flatten = function (values) {
                    return [].concat.apply([], values);
                };
                return QueryProvider;
            }());
        }
    };
});
System.register("Query/QueryXml", ["Query/Query"], function (exports_2, context_2) {
    "use strict";
    var Query_1;
    var __moduleName = context_2 && context_2.id;
    function GetQueryXml(query, maxRowCount, format) {
        if (maxRowCount === void 0) { maxRowCount = 0; }
        if (format === void 0) { format = false; }
        var dataQuery = Query_1.GetRootQuery(query);
        if (format) {
            return formatXml(GetDataQueryXml(dataQuery, maxRowCount));
        }
        else {
            return GetDataQueryXml(dataQuery, maxRowCount);
        }
    }
    exports_2("default", GetQueryXml);
    function GetDataQueryXml(query, maxRowCount) {
        var xml = [];
        xml.push('<fetch mapping="logical"');
        if (maxRowCount > 0) {
            xml.push(" count=\"" + maxRowCount + "\"");
        }
        xml.push('>');
        xml.push("<entity name=\"" + query.EntityName + "\" >");
        xml.push(getQueryXml(query));
        xml.push('</entity>');
        xml.push('</fetch>');
        return xml.join('');
    }
    function getQueryXml(query) {
        var xml = [];
        query.Attributes.forEach(function (attribute) {
            if (query.Alias[attribute]) {
                xml.push("<attribute name=\"" + attribute + "\" alias=\"" + query.Alias[attribute] + "\" />");
            }
            else {
                xml.push("<attribute name=\"" + attribute + "\" />");
            }
        });
        query.OrderBy.forEach(function (attribute) {
            if (attribute.indexOf('_') == 0) {
                xml.push("<order attribute=\"" + attribute.slice(1) + "\" descending=\"true\" />");
            }
            else {
                xml.push("<order attribute=\"" + attribute + "\" />");
            }
        });
        if (query.Conditions.length > 0) {
            var hasOrCondition = false;
            var filters = [];
            filters.push('<filter type="and">');
            for (var _i = 0, _a = query.Conditions; _i < _a.length; _i++) {
                var filter = _a[_i];
                if (filter && filter.hasOwnProperty('length')) {
                    hasOrCondition = true;
                    var conditions = filter;
                    filters.push('</filter>');
                    filters.push('<filter type="or">');
                    for (var _b = 0, conditions_1 = conditions; _b < conditions_1.length; _b++) {
                        var condition = conditions_1[_b];
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
            for (var _c = 0, _d = query.Joins; _c < _d.length; _c++) {
                var join = _d[_c];
                xml.push("<link-entity name=\"" + join.EntityName + "\" alias=\"" + join.JoinAlias + "\" from=\"" + join.JoinFromAttributeName + "\" to=\"" + join.JoinToAttributeName + "\" link-type=\"" + (join.IsOuterJoin ? 'outer' : 'inner') + "\">");
                xml.push(getQueryXml(join));
                xml.push('</link-entity>');
            }
        }
        return xml.join('\n');
    }
    function getConditionXml(condition) {
        var xml = [];
        if (condition.AttributeName.indexOf('.') > -1) {
            condition.AttributeName = condition.AttributeName.split('.')[1] + "\" entityname=\"" + condition.AttributeName.split('.')[0];
        }
        if (condition.Values && condition.Values.length > 0) {
            if (condition.Values.length > 1) {
                xml.push("<condition attribute=\"" + condition.AttributeName + "\" operator=\"" + condition.Operator + "\">");
                for (var _i = 0, _a = condition.Values; _i < _a.length; _i++) {
                    var value = _a[_i];
                    xml.push("<value>" + encodeValue(value) + "</value>");
                }
                xml.push('</condition>');
            }
            else {
                xml.push("<condition attribute=\"" + condition.AttributeName + "\" operator=\"" + condition.Operator + "\" value=\"" + encodeValue(condition.Values[0]) + "\" />");
            }
        }
        else {
            xml.push("<condition attribute=\"" + condition.AttributeName + "\" operator=\"" + condition.Operator + "\" />");
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
    return {
        setters: [
            function (Query_1_1) {
                Query_1 = Query_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("Dynamics/DynamicsRequest", ["Query/Query", "Query/QueryXml", "Dynamics/Dynamics"], function (exports_3, context_3) {
    "use strict";
    var Query_2, QueryXml_1, Dynamics_1;
    var __moduleName = context_3 && context_3.id;
    function dynamicsQuery(query, maxRowCount, headers) {
        var dataQuery = Query_2.GetRootQuery(query);
        if (!dataQuery.EntityPath) {
            throw new Error('dynamicsQuery requires a Query object with an EntityPath');
        }
        return dynamicsQueryUrl("/api/data/" + Dynamics_1.WebApiVersion + "/" + dataQuery.EntityPath, query, maxRowCount, headers);
    }
    exports_3("dynamicsQuery", dynamicsQuery);
    function dynamicsQueryUrl(dynamicsEntitySetUrl, query, maxRowCount, headers) {
        var querySeparator = (dynamicsEntitySetUrl.indexOf('?') > -1 ? '&' : '?');
        return request("" + dynamicsEntitySetUrl + querySeparator + "fetchXml=" + escape(QueryXml_1.default(query, maxRowCount)), 'GET', undefined, headers);
    }
    exports_3("dynamicsQueryUrl", dynamicsQueryUrl);
    function dynamicsRequest(dynamicsEntitySetUrl, headers) {
        return request(dynamicsEntitySetUrl, 'GET', undefined, headers);
    }
    exports_3("dynamicsRequest", dynamicsRequest);
    function dynamicsSave(entitySetName, data, id, headers) {
        if (id) {
            return request("/api/data/" + Dynamics_1.WebApiVersion + "/" + entitySetName + "(" + trimId(id) + ")", 'PATCH', data, headers);
        }
        else {
            return request("/api/data/" + Dynamics_1.WebApiVersion + "/" + entitySetName + "()", 'POST', data, headers);
        }
    }
    exports_3("dynamicsSave", dynamicsSave);
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
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var item = data_1[_i];
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
    exports_3("formatDynamicsResponse", formatDynamicsResponse);
    function request(url, method, body, headers) {
        return fetch(url, {
            method: method,
            headers: __assign({ 'Content-Type': 'application/json; charset=utf-8' }, Dynamics_1.DynamicsHeaders, headers),
            body: body
        })
            .then(function (response) { return response.json(); })
            .then(function (data) { return formatDynamicsResponse(data); });
    }
    function trimId(id) {
        return (id || '').replace(/{|}/g, '');
    }
    return {
        setters: [
            function (Query_2_1) {
                Query_2 = Query_2_1;
            },
            function (QueryXml_1_1) {
                QueryXml_1 = QueryXml_1_1;
            },
            function (Dynamics_1_1) {
                Dynamics_1 = Dynamics_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("Dynamics/DynamicsBatch", ["Dynamics/DynamicsRequest", "Query/Query", "Query/QueryXml", "Dynamics/Dynamics"], function (exports_4, context_4) {
    "use strict";
    var DynamicsRequest_1, Query_3, QueryXml_2, Dynamics_2, Batch;
    var __moduleName = context_4 && context_4.id;
    function dynamicsBatch(headers) {
        return new Batch(headers);
    }
    exports_4("dynamicsBatch", dynamicsBatch);
    function dynamicsBatchRequest() {
        var url = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            url[_i] = arguments[_i];
        }
        var batch = new Batch();
        batch.requestAllUrls(url);
        return batch.execute();
    }
    exports_4("dynamicsBatchRequest", dynamicsBatchRequest);
    function dynamicsBatchQuery() {
        var query = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            query[_i] = arguments[_i];
        }
        var batch = new Batch();
        batch.requestAll(query);
        return batch.execute();
    }
    exports_4("dynamicsBatchQuery", dynamicsBatchQuery);
    return {
        setters: [
            function (DynamicsRequest_1_1) {
                DynamicsRequest_1 = DynamicsRequest_1_1;
            },
            function (Query_3_1) {
                Query_3 = Query_3_1;
            },
            function (QueryXml_2_1) {
                QueryXml_2 = QueryXml_2_1;
            },
            function (Dynamics_2_1) {
                Dynamics_2 = Dynamics_2_1;
            }
        ],
        execute: function () {
            Batch = /** @class */ (function () {
                function Batch(headers) {
                    this.headers = headers;
                    this.Changes = [];
                    this.RelatedChanges = [];
                }
                Batch.prototype.execute = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var results, _i, _a, change, changeIndex, relatedId, related;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, Batch.requestBatch("/api/data/" + Dynamics_2.WebApiVersion + "/$batch", this.Changes, this.headers)];
                                case 1:
                                    results = _b.sent();
                                    if (!(this.RelatedChanges.length > 0)) return [3 /*break*/, 3];
                                    for (_i = 0, _a = this.RelatedChanges; _i < _a.length; _i++) {
                                        change = _a[_i];
                                        changeIndex = this.Changes.indexOf(change.relatedChange);
                                        relatedId = results[changeIndex];
                                        change.entityData[change.relatedPropertyName + "@odata.bind"] = change.relatedChange.entitySetName + "(" + Batch.trimId(relatedId) + ")";
                                    }
                                    return [4 /*yield*/, Batch.requestBatch("/api/data/" + Dynamics_2.WebApiVersion + "/$batch", this.RelatedChanges, this.headers)];
                                case 2:
                                    related = _b.sent();
                                    return [2 /*return*/, results.concat(related)];
                                case 3: return [2 /*return*/, results];
                            }
                        });
                    });
                };
                Batch.prototype.requestAllUrls = function (urls) {
                    this.Changes.push.apply(this.Changes, urls.map(function (entitySetQuery) { return ({ entitySetQuery: entitySetQuery }); }));
                    return this;
                };
                Batch.prototype.requestAll = function (queries) {
                    var _this = this;
                    this.Changes.push.apply(queries.map(function (query) {
                        var dataQuery = Query_3.GetRootQuery(query);
                        _this.request(query);
                        return {
                            entitySetName: dataQuery.EntityPath,
                            entitySetQuery: "fetchXml=" + escape(QueryXml_2.default(query))
                        };
                    }));
                    return this;
                };
                Batch.prototype.request = function (query, maxRowCount) {
                    if (maxRowCount === void 0) { maxRowCount = Dynamics_2.DefaultMaxRecords; }
                    var dataQuery = Query_3.GetRootQuery(query);
                    if (!dataQuery.EntityPath) {
                        throw new Error('dynamicsBatch request requires a Query object with an EntityPath');
                    }
                    this.Changes.push({
                        entitySetName: dataQuery.EntityPath,
                        entitySetQuery: "fetchXml=" + escape(QueryXml_2.default(query, maxRowCount))
                    });
                    return this;
                };
                Batch.prototype.deleteEntity = function (entitySetName, id) {
                    this.Changes.push({
                        entitySetName: entitySetName,
                        entityId: id,
                        entityData: 'DELETE'
                    });
                    return this;
                };
                Batch.prototype.saveEntity = function (entitySetName, data, id) {
                    this.Changes.push({
                        entitySetName: entitySetName,
                        entityId: id,
                        entityData: data
                    });
                    return this;
                };
                Batch.prototype.createRelatedEntity = function (entitySetName, data, navigationPropertyName) {
                    var lastChange = this.Changes[this.Changes.length - 1];
                    if (!lastChange || lastChange.entityData == 'DELETE')
                        throw new Error('createRelatedEntity relies on the previous change which was not found in the batch.');
                    if (lastChange.entityId) {
                        data[navigationPropertyName + "@odata.bind"] = lastChange.entitySetName + "(" + lastChange.entityId + ")";
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
                };
                Batch.requestBatch = function (url, requests, headers) {
                    var batchId = Batch.createId();
                    return fetch(url, {
                        method: 'POST',
                        headers: __assign({ 'Content-Type': "multipart/mixed;boundary=batch_" + batchId }, Dynamics_2.DynamicsHeaders, headers),
                        body: Batch.formatBatchRequest(batchId, requests)
                    })
                        .then(function (response) { return Batch.formatBatchResponse(response.text()); });
                };
                Batch.formatBatchRequest = function (batchId, changes) {
                    var batchBody = [];
                    var requestBody = [];
                    var changeNumber = 1;
                    var changesetId = Batch.createId();
                    batchBody.push("--batch_" + batchId);
                    batchBody.push("Content-Type: multipart/mixed;boundary=changeset_" + changesetId);
                    batchBody.push('');
                    for (var _i = 0, changes_1 = changes; _i < changes_1.length; _i++) {
                        var change = changes_1[_i];
                        if (change.entitySetQuery) {
                            requestBody.push("--batch_" + batchId);
                            requestBody.push('Content-Type: application/http');
                            requestBody.push('Content-Transfer-Encoding:binary');
                            requestBody.push('');
                            if (change.entitySetName) {
                                requestBody.push("GET " + encodeURI("/api/data/" + Dynamics_2.WebApiVersion + "/" + change.entitySetName + "?" + change.entitySetQuery) + " HTTP/1.1");
                            }
                            else {
                                requestBody.push("GET " + encodeURI(change.entitySetQuery) + " HTTP/1.1");
                            }
                            requestBody.push('Accept: application/json');
                            requestBody.push('Prefer: odata.include-annotations="OData.Community.Display.V1.FormattedValue"');
                            requestBody.push('');
                        }
                        else {
                            batchBody.push("--changeset_" + changesetId);
                            batchBody.push('Content-Type: application/http');
                            batchBody.push('Content-Transfer-Encoding:binary');
                            batchBody.push("Content-ID: " + changeNumber++);
                            batchBody.push('');
                            batchBody.push((change.entityId ? 'PATCH' : 'POST') + " " + encodeURI("/api/data/" + Dynamics_2.WebApiVersion + "/" + change.entitySetName + "(" + Batch.trimId(change.entityId) + ")") + " HTTP/1.1");
                            batchBody.push('Content-Type: application/json;type=entry');
                            batchBody.push('');
                            batchBody.push(JSON.stringify(change.entityData));
                        }
                    }
                    batchBody.push("--changeset_" + changesetId + "--");
                    batchBody.push(requestBody.join('\n'));
                    batchBody.push("--batch_" + batchId + "--");
                    return batchBody.join('\n');
                };
                Batch.formatBatchResponse = function (responseText) {
                    return responseText.then(function (response) {
                        if (response) {
                            if (response.indexOf('"innererror"') > -1
                                || response.indexOf('HTTP/1.1 500 Internal Server Error') > -1
                                || response.indexOf('HTTP/1.1 400 Bad Request') > -1) {
                                throw new Error('Batch Request Error: ' + response);
                            }
                            else {
                                var data = [];
                                var responses = response.split('--changesetresponse');
                                for (var _i = 0, responses_1 = responses; _i < responses_1.length; _i++) {
                                    var response_1 = responses_1[_i];
                                    var contentId = ((/Content-ID:\s?(.*)\b/g).exec(response_1) || []).slice(1)[0];
                                    var entityId = ((/OData-EntityId:[^(]*\((.*)\)/g).exec(response_1) || []).slice(1)[0];
                                    data[contentId - 1] = entityId;
                                }
                                var requests = response.split('--batchresponse');
                                for (var _a = 0, requests_1 = requests; _a < requests_1.length; _a++) {
                                    var request = requests_1[_a];
                                    //TODO: determine better way of identifying request responses
                                    if (request.indexOf('OData.Community.Display.V1.FormattedValue') > -1) {
                                        var responseIndex = request.indexOf('{');
                                        var json = request.substring(responseIndex);
                                        var item = JSON.parse(json);
                                        data.push(DynamicsRequest_1.formatDynamicsResponse(item));
                                    }
                                }
                                return data;
                            }
                        }
                    });
                };
                Batch.createId = function () {
                    return 'id' + Math.random().toString(16).slice(2);
                };
                Batch.trimId = function (id) {
                    return (id || '').replace(/{|}/g, '');
                };
                return Batch;
            }());
        }
    };
});
System.register("Dynamics/Dynamics", ["Dynamics/DynamicsRequest", "Dynamics/DynamicsBatch"], function (exports_5, context_5) {
    "use strict";
    var DynamicsRequest_2, DynamicsBatch_1, WebApiVersion, DefaultMaxRecords, DynamicsHeaders, DynamicsClient;
    var __moduleName = context_5 && context_5.id;
    function dynamics(accessToken) {
        return new DynamicsClient(accessToken);
    }
    exports_5("default", dynamics);
    return {
        setters: [
            function (DynamicsRequest_2_1) {
                DynamicsRequest_2 = DynamicsRequest_2_1;
            },
            function (DynamicsBatch_1_1) {
                DynamicsBatch_1 = DynamicsBatch_1_1;
            }
        ],
        execute: function () {
            exports_5("WebApiVersion", WebApiVersion = 'v9.1');
            exports_5("DefaultMaxRecords", DefaultMaxRecords = 100);
            exports_5("DynamicsHeaders", DynamicsHeaders = {
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                'Prefer': 'odata.include-annotations=OData.Community.Display.V1.FormattedValue'
            });
            DynamicsClient = /** @class */ (function () {
                function DynamicsClient(accessToken) {
                    if (accessToken) {
                        this.dynamicsHeaders = {
                            'Authorization': 'Bearer ' + accessToken
                        };
                    }
                }
                DynamicsClient.prototype.batch = function () {
                    return DynamicsBatch_1.dynamicsBatch(this.dynamicsHeaders);
                };
                DynamicsClient.prototype.fetch = function (query, maxRowCount) {
                    if (maxRowCount === void 0) { maxRowCount = DefaultMaxRecords; }
                    return DynamicsRequest_2.dynamicsQuery(query, maxRowCount, this.dynamicsHeaders);
                };
                DynamicsClient.prototype.save = function (entitySetName, data, id) {
                    return DynamicsRequest_2.dynamicsSave(entitySetName, data, id, this.dynamicsHeaders);
                };
                DynamicsClient.prototype.optionset = function (entityName, attributeName) {
                    return DynamicsRequest_2.dynamicsRequest("/api/data/" + WebApiVersion + "/EntityDefinitions(LogicalName='" + entityName + "')/Attributes(LogicalName='" + attributeName + "')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet($select=Options),GlobalOptionSet($select=Options)").then(function (attribute) {
                        return (attribute.OptionSet || attribute.GlobalOptionSet).Options.map(function (option) { return ({
                            label: option.Label.UserLocalizedLabel.Label,
                            value: option.Value
                        }); });
                    });
                };
                return DynamicsClient;
            }());
        }
    };
});
System.register("tests/queryTests", ["Query/Query", "Query/QueryXml"], function (exports_6, context_6) {
    "use strict";
    var Query_4, QueryXml_3;
    var __moduleName = context_6 && context_6.id;
    function createQueryWithAllExpressions() {
        var thisQuery = Query_4.default('QueryWithAllExpressions');
        thisQuery
            .select('prop1', 'prop2', 'prop3')
            .alias('prop1', 'Property1')
            .orderBy('prop1')
            .orderBy('prop2', true)
            .path('path')
            .where('prop3', Query_4.QueryOperator.Contains, 'abc')
            .where('prop2', Query_4.QueryOperator.In, 1, 2, 3, 4)
            .whereAny(function (or) {
            or('prop1', Query_4.QueryOperator.Equals, 'a');
            or('prop1', Query_4.QueryOperator.Equals, 'b');
            or('prop1', Query_4.QueryOperator.Equals, 'c');
        })
            .join('JoinWithNoExpressions', 'joinid');
        var fetchXml = QueryXml_3.default(thisQuery, 999, true);
    }
    exports_6("createQueryWithAllExpressions", createQueryWithAllExpressions);
    return {
        setters: [
            function (Query_4_1) {
                Query_4 = Query_4_1;
            },
            function (QueryXml_3_1) {
                QueryXml_3 = QueryXml_3_1;
            }
        ],
        execute: function () {
        }
    };
});
