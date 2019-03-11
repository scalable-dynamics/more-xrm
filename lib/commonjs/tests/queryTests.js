"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Query_1 = require("../Query/Query");
const QueryXml_1 = require("../Query/QueryXml");
function createQueryWithAllExpressions() {
    const thisQuery = Query_1.default('account');
    thisQuery
        .select('accountid', 'name')
        .alias('accountid', 'Id')
        .orderBy('name')
        .orderBy('accountid', true)
        .path('accounts')
        .where('name', Query_1.QueryOperator.Contains, 'abc')
        .where('accountnumber', Query_1.QueryOperator.In, 1, 2, 3, 4)
        .whereAny(or => {
        or('name', Query_1.QueryOperator.Equals, 'a');
        or('name', Query_1.QueryOperator.Equals, 'b');
        or('name', Query_1.QueryOperator.Equals, 'c');
    })
        .join('contact', 'customerid');
    const fetchXml = QueryXml_1.default(thisQuery, 999, true);
    if (!fetchXml) {
        throw new Error('QueryXml could not be generated!');
    }
}
exports.createQueryWithAllExpressions = createQueryWithAllExpressions;
