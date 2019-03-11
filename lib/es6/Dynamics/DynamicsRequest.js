import { GetRootQuery } from "../Query/Query";
import GetQueryXml from "../Query/QueryXml";
import { DynamicsHeaders, WebApiVersion } from "./Dynamics";
export function dynamicsQuery(query, maxRowCount, headers) {
    const dataQuery = GetRootQuery(query);
    if (!dataQuery.EntityPath) {
        throw new Error('dynamicsQuery requires a Query object with an EntityPath');
    }
    return dynamicsQueryUrl(`/api/data/${WebApiVersion}/${dataQuery.EntityPath}`, query, maxRowCount, headers);
}
export function dynamicsQueryUrl(dynamicsEntitySetUrl, query, maxRowCount, headers) {
    const querySeparator = (dynamicsEntitySetUrl.indexOf('?') > -1 ? '&' : '?');
    return request(`${dynamicsEntitySetUrl}${querySeparator}fetchXml=${escape(GetQueryXml(query, maxRowCount))}`, 'GET', undefined, headers);
}
export function dynamicsRequest(dynamicsEntitySetUrl, headers) {
    return request(dynamicsEntitySetUrl, 'GET', undefined, headers);
}
export function dynamicsSave(entitySetName, data, id, headers) {
    if (id) {
        return request(`/api/data/${WebApiVersion}/${entitySetName}(${trimId(id)})`, 'PATCH', data, headers);
    }
    else {
        return request(`/api/data/${WebApiVersion}/${entitySetName}()`, 'POST', data, headers);
    }
}
export function formatDynamicsResponse(data) {
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
function request(url, method, body, headers) {
    return fetch(url, {
        method: method,
        headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, DynamicsHeaders, headers),
        body: body
    })
        .then(response => response.json())
        .then(data => formatDynamicsResponse(data));
}
function trimId(id) {
    return (id || '').replace(/{|}/g, '');
}
