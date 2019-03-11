"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Dynamics_1 = require("../Dynamics/Dynamics");
const Query_1 = require("../Query/Query");
function dynamicsTestAll() {
    return __awaiter(this, void 0, void 0, function* () {
        const dyn = Dynamics_1.default();
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
            .where('name', Query_1.QueryOperator.StartsWith, 'xrm')
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
