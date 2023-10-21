import { extend } from "@react-three/fiber";
import trailFragmentShader from "../shaders/trail.frag";
import trailVertexShader from "../shaders/trail.vert";
import { shaderMaterial } from "@react-three/drei";

export const TrailMaterial = shaderMaterial(
    {},
    trailVertexShader,
    trailFragmentShader
);

extend({ TrailMaterial });

declare global {
    namespace JSX {
        interface IntrinsicElements {
            trailMaterial: any;
        }
    }
}
