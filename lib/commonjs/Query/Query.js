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
