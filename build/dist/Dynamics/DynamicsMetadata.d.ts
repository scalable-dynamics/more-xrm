export default function dynamicsMetadata(accessToken?: string): DynamicsMetadata;
export interface DynamicsMetadata {
    attributes(entityName: string): Promise<AttributeMetadata[]>;
    entities(): Promise<EntityMetadata[]>;
    entity(entityName: string): Promise<EntityAttributeMetadata>;
}
export interface EntityMetadata {
    LogicalName: string;
    EntitySetName: string;
    DisplayName: string;
    Description: string;
}
export interface EntityAttributeMetadata extends EntityMetadata {
    Attributes: AttributeMetadata[];
}
export interface AttributeMetadata {
    LogicalName: string;
    DisplayName: string;
    Type: AttributeTypeCode;
    LookupEntityName?: string;
    PicklistOptions?: OptionSetMetadata[];
}
export interface OptionSetMetadata {
    Label: string;
    Value: number;
}
export declare type AttributeTypeCode = 'BigInt' | 'Boolean' | 'Customer' | 'DateTime' | 'Decimal' | 'Double' | 'Integer' | 'Lookup' | 'Memo' | 'Money' | 'PartyList' | 'Picklist' | 'State' | 'Status' | 'String';
