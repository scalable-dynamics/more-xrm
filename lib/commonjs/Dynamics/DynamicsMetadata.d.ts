import { AttributeMetadata, EntityAttributeMetadata, LookupAttributeMetadata } from "./Model/AttributeMetadata";
import { EntityMetadata } from "./Model/EntityMetadata";
import { OptionSetAttributeMetadata, OptionSetMetadata } from "./Model/OptionSetMetadata";
export declare type DynamicsEntityMetadata = EntityAttributeMetadata;
export declare type DynamicsAttributeMetadata = AnyAttributeMetadata;
export declare type DynamicsOptionSetMetadata = OptionSetMetadata;
export declare type DynamicsLookupAttributeMetadata = LookupAttributeMetadata;
export declare type DynamicsOptionSetAttributeMetadata = OptionSetAttributeMetadata;
export default function dynamicsMetadata(accessToken?: string): DynamicsMetadata;
export declare function isLookupAttribute(attribute: DynamicsAttributeMetadata): attribute is DynamicsLookupAttributeMetadata;
export declare function isOptionSetAttribute(attribute: DynamicsAttributeMetadata): attribute is DynamicsOptionSetAttributeMetadata;
export interface DynamicsMetadata {
    attributes(entityName: string): Promise<AttributeMetadata[]>;
    entities(): Promise<EntityMetadata[]>;
    entity(entityName: string): Promise<EntityAttributeMetadata>;
    entityAttributes(...entityNames: string[]): Promise<EntityAttributeMetadata[]>;
}
declare type AnyAttributeMetadata = AttributeMetadata | LookupAttributeMetadata | OptionSetAttributeMetadata;
export {};
