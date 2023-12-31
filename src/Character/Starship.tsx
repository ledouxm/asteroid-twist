/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.13 .\public\starship.glb --types -o ./src/Character/Starship.tsx 
*/

import * as THREE from "three";
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { MeshCollider } from "@react-three/rapier";
import { useSpring } from "react-spring";
import { useFrame } from "@react-three/fiber";

type GLTFResult = GLTF & {
    nodes: {
        spaceship: THREE.Mesh;
        body: THREE.Mesh;
        cockpit: THREE.Mesh;
        thrusters: THREE.Mesh;
        trail: THREE.Mesh;
        wings1: THREE.Mesh;
        wings2: THREE.Mesh;
    };
    materials: {
        Material: THREE.MeshStandardMaterial;
        ["Material.002"]: THREE.MeshStandardMaterial;
        ["Material.001"]: THREE.MeshStandardMaterial;
    };
};

type ContextType = Record<
    string,
    React.ForwardRefExoticComponent<JSX.IntrinsicElements["mesh"]>
>;

export function Starship({
    isOn,
    ...props
}: JSX.IntrinsicElements["group"] & { isOn: boolean }) {
    const { nodes, materials } = useGLTF("/starship.glb") as GLTFResult;

    const trailRef = useRef<THREE.Mesh>(null);

    const trailSize = useSpring({
        from: { x: 0.2 },
        to: { x: isOn ? 1 : 0.2 },
        config: {
            mass: 3,
            bounce: 0,
        },
    });

    useFrame(() => {
        trailRef.current?.scale.set(1, 1, trailSize.x.get());
        trailRef.current?.position.set(0, 0, 1 - trailSize.x.get());
    });
    return (
        <group {...props} dispose={null}>
            <mesh
                geometry={nodes.spaceship.geometry}
                material={materials.Material}
                position={[0, 4, 0]}
                rotation={[Math.PI / 2, Math.PI, 0]}
            >
                <mesh
                    geometry={nodes.body.geometry}
                    material={materials["Material.002"]}
                />
                <mesh
                    geometry={nodes.cockpit.geometry}
                    material={materials["Material.001"]}
                />
                <mesh
                    geometry={nodes.thrusters.geometry}
                    material={materials.Material}
                />
                <group position={[1.961, 0, -8.719]} scale={[0.86, 1, 1]}>
                    <mesh
                        ref={trailRef}
                        geometry={nodes.trail.geometry}
                        castShadow
                        receiveShadow
                        // material={nodes.trail.material}
                    >
                        <meshStandardMaterial
                            emissive="lightblue"
                            emissiveIntensity={2}
                            toneMapped={false}
                        />
                    </mesh>
                </group>
                <mesh
                    geometry={nodes.wings1.geometry}
                    material={materials.Material}
                />
                <mesh
                    geometry={nodes.wings2.geometry}
                    material={materials["Material.002"]}
                    position={[0.069, 0, 0]}
                />
            </mesh>
        </group>
    );
}

useGLTF.preload("/starship.glb");
