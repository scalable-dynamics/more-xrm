import query, { QueryOperator } from "../Query/Query";
import GetQueryXml from "../Query/QueryXml";
export function createQueryWithAllExpressions() {
    const thisQuery = query('account');
    thisQuery
        .select('accountid', 'name')
        .alias('accountid', 'Id')
        .orderBy('name')
        .orderBy('accountid', true)
        .path('accounts')
        .where('name', QueryOperator.Contains, 'abc')
        .where('accountnumber', QueryOperator.In, 1, 2, 3, 4)
        .whereAny(or => {
        or('name', QueryOperator.Equals, 'a');
        or('name', QueryOperator.Equals, 'b');
        or('name', QueryOperator.Equals, 'c');
    })
        .join('contact', 'customerid');
    const fetchXml = GetQueryXml(thisQuery, 999, true);
    if (!fetchXml) {
        throw new Error('QueryXml could not be generated!');
    }
}
