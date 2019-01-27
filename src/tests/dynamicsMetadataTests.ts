import dynamicsMetadata from "../Dynamics/DynamicsMetadata";

export async function dynamicsMetadataRetrieveAll() {
    const meta = dynamicsMetadata();

    const entities = await meta.entities();
    const findAccount = entities.filter(e => e.LogicalName === 'account')[0];

    const accountEntity = await meta.entity('account');
    const matchingAccount = findAccount.DisplayName === accountEntity.DisplayName;

    if (!matchingAccount) {
        throw new Error('Account metadata was not found!');
    }

    const attributes = await meta.attributes('account');
    const findAccountName = attributes.filter(a => a.LogicalName === 'name')[0];

    if (!findAccountName) {
        throw new Error('Account name attribute was not found!');
    }
}