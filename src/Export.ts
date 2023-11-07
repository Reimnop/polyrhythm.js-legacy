import { Prefab } from "pa-prefab";
import { PAObject, AutoKillType, ObjectType, Shape, TriangleOption, Easing } from "pa-common";
import { ExportConfiguration } from "./ExportConfiguration";
import { RenderResult } from "polyrhythmjs";

export function generatePrefab(renderResult: RenderResult, configuration: ExportConfiguration): object {
    const prefab = new Prefab(configuration.name, configuration.prefabType);
    const viewport = new PAObject("Viewport", prefab);
    viewport.startTime = 0.0;
    viewport.autoKillType = AutoKillType.Fixed;
    viewport.autoKillOffset = configuration.duration;
    viewport.objectType = ObjectType.Empty;
    viewport.positionParenting = true;
    viewport.scaleParenting = true;
    viewport.rotationParenting = true;
    viewport.pushPosition(0.0, configuration.globalPosition[0], configuration.globalPosition[1]);
    viewport.pushScale(0.0, configuration.globalScale[0], configuration.globalScale[1]);
    viewport.pushRotation(0.0, configuration.globalRotation);
    viewport.pushColor(0.0, 0);
    prefab.addObject(viewport);
    for (const triangle of renderResult.animatedRightTriangles) {
        if (triangle.startTime > triangle.killTime)
            continue;
        
        const triangleObject = new PAObject("Triangle", prefab);
        triangleObject.parent = viewport;
        triangleObject.startTime = triangle.startTime;
        triangleObject.autoKillType = AutoKillType.Fixed;
        triangleObject.autoKillOffset = triangle.killTime - triangle.startTime;
        triangleObject.renderDepth = triangle.renderDepth;
        triangleObject.positionParenting = true;
        triangleObject.scaleParenting = true;
        triangleObject.rotationParenting = true;
        triangleObject.originX = 0.5;
        triangleObject.originY = 0.5;
        triangleObject.objectType = ObjectType.Decoration;
        triangleObject.shape = Shape.Triangle;
        triangleObject.shapeOption = TriangleOption.RightAngledSolid;
        
        for (const key of triangle.positionKeys) {
            const time = key.time - triangleObject.startTime;
            triangleObject.pushPosition(time, key.value[0], key.value[1], Easing.Instant);
        }

        for (const key of triangle.scaleKeys) {
            const time = key.time - triangleObject.startTime;
            triangleObject.pushScale(time, key.value[0], key.value[1], Easing.Instant);
        }

        // PA uses relative rotation, so we need to calculate the delta
        let lastRotation = 0.0;
        for (const key of triangle.rotationKeys) {
            const time = key.time - triangleObject.startTime;
            const rotationDegree = wrapDegrees(key.value / Math.PI * 180.0);
            const delta = rotationDegree - lastRotation;
            triangleObject.pushRotation(time, delta, Easing.Instant);
            lastRotation = rotationDegree;
        }

        for (const key of triangle.colorKeys) {
            const time = key.time - triangleObject.startTime;
            triangleObject.pushColor(time, key.value, Easing.Instant);
        }

        prefab.addObject(triangleObject);
    }

    return prefab.toJson();
}

function wrapDegrees(degrees: number): number {
    return (degrees % 360.0 + 360.0) % 360.0;
}
