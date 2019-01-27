var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { formatDynamicsResponse } from "./DynamicsRequest";
import { GetRootQuery } from "../Query/Query";
import GetQueryXml from "../Query/QueryXml";
import { WebApiVersion, DynamicsHeaders, DefaultMaxRecords } from "./Dynamics";
export function dynamicsBatch(headers) {
    return new Batch(headers);
}
export function dynamicsBatchRequest(...url) {
    const batch = new Batch();
    batch.requestAllUrls(url);
    return batch.execute();
}
export function dynamicsBatchQuery(...query) {
    const batch = new Batch();
    batch.requestAll(query);
    return batch.execute();
}
class Batch {
    constructor(headers) {
        this.headers = headers;
        this.Changes = [];
        this.RelatedChanges = [];
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield Batch.requestBatch(`/api/data/${WebApiVersion}/$batch`, this.Changes, this.headers);
            if (this.RelatedChanges.length > 0) {
                for (let change of this.RelatedChanges) {
                    let changeIndex = this.Changes.indexOf(change.relatedChange);
                    let relatedId = results[changeIndex];
                    change.entityData[`${change.relatedPropertyName}@odata.bind`] = `${change.relatedChange.entitySetName}(${Batch.trimId(relatedId)})`;
                }
                const related = yield Batch.requestBatch(`/api/data/${WebApiVersion}/$batch`, this.RelatedChanges, this.headers);
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
            const dataQuery = GetRootQuery(query);
            this.request(query);
            return {
                entitySetName: dataQuery.EntityPath,
                entitySetQuery: `fetchXml=${escape(GetQueryXml(query))}`
            };
        }));
        return this;
    }
    request(query, maxRowCount = DefaultMaxRecords) {
        const dataQuery = GetRootQuery(query);
        if (!dataQuery.EntityPath) {
            throw new Error('dynamicsBatch request requires a Query object with an EntityPath');
        }
        this.Changes.push({
            entitySetName: dataQuery.EntityPath,
            entitySetQuery: `fetchXml=${escape(GetQueryXml(query, maxRowCount))}`
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
            headers: Object.assign({ 'Content-Type': `multipart/mixed;boundary=batch_${batchId}` }, DynamicsHeaders, headers),
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
                    requestBody.push(`GET ${encodeURI(`/api/data/${WebApiVersion}/${change.entitySetName}?${change.entitySetQuery}`)} HTTP/1.1`);
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
                batchBody.push(`${change.entityId ? 'PATCH' : 'POST'} ${encodeURI(`/api/data/${WebApiVersion}/${change.entitySetName}(${Batch.trimId(change.entityId)})`)} HTTP/1.1`);
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
                            data.push(formatDynamicsResponse(item));
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
