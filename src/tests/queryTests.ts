import query, { QueryOperator } from "../Query/Query";
import GetQueryXml from "../Query/QueryXml";

export function createQueryWithAllExpressions()
{
    const thisQuery = query('QueryWithAllExpressions');
    thisQuery
        .select('prop1', 'prop2', 'prop3')
        .alias('prop1', 'Property1')
        .orderBy('prop1')
        .orderBy('prop2',true)
        .path('path')
        .where('prop3', QueryOperator.Contains, 'abc')
        .where('prop2', QueryOperator.In, 1, 2, 3, 4)
        .whereAny(or =>
        {
            or('prop1', QueryOperator.Equals, 'a');
            or('prop1', QueryOperator.Equals, 'b');
            or('prop1', QueryOperator.Equals, 'c');
        })
        .join('JoinWithNoExpressions', 'joinid');

        const fetchXml = GetQueryXml(thisQuery, 999, true);
}