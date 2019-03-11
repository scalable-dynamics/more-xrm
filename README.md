<p align="center"><img src="https://oflow.azurewebsites.net/images/XrmToolsLogo.png" width="250" /></p>

# more-xrm

[![](https://img.shields.io/npm/v/more-xrm.svg)](https://www.npmjs.com/package/more-xrm)
[![npm](https://img.shields.io/npm/dt/more-xrm.svg)](https://www.npmtrends.com/more-xrm)

Create more applications using the Microsoft Dynamics 365/XRM platform

**`more-xrm`** is a TypeScript library that enables you to connect, query and manage Dynamics 365 data using the modern fetch api. Query operations and batch procedures are available for connecting to the Dynamics Web API.

> **_more-xrm enables querying the dynamics data model from any application_**

* provides methods for querying and managing Dynamics 365 data
* introduces **`Query`** interface for describing columns, filters and other query information
* provides an easy way to retrieve data for a **`Query`**, with formatting and attribute alias names
* introduces **`Batch`** interface for describing changesets and committing them in batch
	* automatically sets related identifiers for parental records created within the same batch
* provides methods for querying and managing Dynamics 365 Entity Metadata
* retrieve information about Entities, Attributes and OptionSets in a concise format
* request metadata for multiple entities and their attributes using a batch operation

## Installation

This module is designed for use with **[Microsoft Dynamics 365 Customer Engagement Web API](https://docs.microsoft.com/en-us/dynamics365/customer-engagement/developer/webapi/web-api-types-operations)** - either a Web Resource with a relative api path or an `authToken` with an associated system user record can be used.

**From [unpkg](https://unpkg.com/) (cdn):**

````html
<script src="https://unpkg.com/more-xrm"></script>
````

>**_or_**

**From [npm](https://npmjs.com/more-xrm):**

```bash
npm install more-xrm
```
___

## How to use

1. Import/Add the `dynamics` method from `'more-xrm/dist/Dynamics'`

   > `import dynamics from 'more-xrm/dist/Dynamics';`

2. Import/Add `query` method and `QueryOperator` enum from `'more-xrm/dist/Query'`

   > `import query, { QueryOperator } from 'more-xrm/dist/Query';`

3. Create a `query` for the Dynamics Account entity:

```typescript
const accounts = query('account')
					.path('accounts') // Indicates Entity Name on Web API Url
					.where('name', QueryOperator.Contains, 'xrm')
					.orderBy('name')
					.select('name');
```

4. Call `dynamics` to obtain a connection to Dynamics:

   > `const dynamicsClient = dynamics(); //option to pass access token`

5. Execute `accounts` query using `dynamicsClient`:

```typescript
dynamicsClient.fetch(accounts).then(results => { /* results is an array of accounts */ });
```

6. Update data in Dynamics by calling `save`:

```typescript
const accountId = accounts[0].accountid; //account with name like '%xrm%'
dynamicsClient.save('accounts', { name: 'more-xrm' }, accountId).then(id => { /* id of account */ });
```

## Example

An application will query the Account entity in Dynamics where the name contains _'xrm'_, then update the Account name to _'more-xrm'_


```typescript
import dynamics from 'more-xrm/dist/Dynamics';
import query, { QueryOperator } from 'more-xrm/dist/Query';

//Create a query
const accounts = query('account')
                    .path('accounts') // Indicates Entity Name on Web API Url
                    .where('name', QueryOperator.Contains, 'xrm')
                    .orderBy('name')
                    .select('name');

//Connect to Dynamics
const dynamicsClient = dynamics();

//Execute accounts query
dynamicsClient.fetch(accounts).then(results => { 

    if(results.length > 0) {
        const accountId = accounts[0].accountid;

        //Update data in Dynamics by calling save:
        dynamicsClient.save('accounts', { name: 'more-xrm' }, accountId).then(id => {
            
            /* Account was updated */

        });
    }
});

```

## License

[MIT License](https://github.com/scalable-dynamics/more-xrm/blob/master/LICENSE)

<svg height="32" viewBox="0 0 14 16" version="1.1" width="28" aria-hidden="true" style="float:left;margin-right:10px;"><path fill-rule="evenodd" d="M7 4c-.83 0-1.5-.67-1.5-1.5S6.17 1 7 1s1.5.67 1.5 1.5S7.83 4 7 4zm7 6c0 1.11-.89 2-2 2h-1c-1.11 0-2-.89-2-2l2-4h-1c-.55 0-1-.45-1-1H8v8c.42 0 1 .45 1 1h1c.42 0 1 .45 1 1H3c0-.55.58-1 1-1h1c0-.55.58-1 1-1h.03L6 5H5c0 .55-.45 1-1 1H3l2 4c0 1.11-.89 2-2 2H2c-1.11 0-2-.89-2-2l2-4H1V5h3c0-.55.45-1 1-1h4c.55 0 1 .45 1 1h3v1h-1l2 4zM2.5 7L1 10h3L2.5 7zM13 10l-1.5-3-1.5 3h3z"></path></svg>

*more-xrm* is licensed under the
[MIT](https://github.com/scalable-dynamics/more-xrm/blob/master/LICENSE) license
