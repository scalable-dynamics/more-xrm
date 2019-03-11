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
const DynamicsMetadata_1 = require("../Dynamics/DynamicsMetadata");
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
