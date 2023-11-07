import { vec2 } from "gl-matrix";
import { PrefabType } from "pa-prefab";

export interface ExportConfiguration {
    name: string;
    prefabType: PrefabType;
    duration: number;
    globalPosition: vec2;
    globalScale: vec2;
    globalRotation: number;
}