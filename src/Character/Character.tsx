import { useEffect, useRef, useState } from "react";
import {
    RigidBody,
    type RapierRigidBody,
    MeshCollider,
    CylinderCollider,
    ConvexHullCollider,
} from "@react-three/rapier";
import { Circle, useGLTF, useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
    BoxGeometry,
    CylinderGeometry,
    Group,
    Mesh,
    MeshStandardMaterial,
    PlaneGeometry,
    Quaternion,
    Vector2,
    Vector3,
} from "three";
import { Controls } from "../App";
import { Turret } from "./Turret";
import { Trail } from "./Trail";
import { GLTF } from "three-stdlib";
import { Starship } from "./Starship";
import { HealthBar, HealthBarClass } from "../HealthBar";

export const innerRadius = 10;
const moveSpeed = 100;
const rotationSpeed = 3;

const damagePerSecond = 5;

export const Character = () => {
    const ref = useRef<RapierRigidBody>(null);
    const groupRef = useRef<Group>(null);
    const lastTick = useRef(0);

    const [healthBar] = useState(() => {
        return new HealthBarClass(100, 100, 3, 0.3);
    });
    const trailRef = useRef<Group>(null);

    const rotationRef = useRef(0);

    const forward = useKeyboardControls<Controls>((state) => state.forward);
    const backward = useKeyboardControls<Controls>((state) => state.backward);
    const left = useKeyboardControls<Controls>((state) => state.left);
    const right = useKeyboardControls<Controls>((state) => state.right);

    useFrame((_, delta) => {
        if (!ref.current) return;
        const difference = new Vector3();
        if (forward) difference.y += delta * moveSpeed;
        if (backward) difference.y -= delta * moveSpeed;
        if (left) rotationRef.current += delta * rotationSpeed;
        if (right) rotationRef.current -= delta * rotationSpeed;

        rotationRef.current =
            ((rotationRef.current + Math.PI) % (Math.PI * 2)) - Math.PI;

        const q = new Quaternion();
        q.setFromAxisAngle(new Vector3(0, 0, 1), rotationRef.current);
        ref.current.setRotation(q, true);

        difference.applyQuaternion(q);
        difference.normalize();

        ref.current?.applyImpulse(
            {
                x: difference.x / 10,
                y: difference.y / 10,
                z: 0,
            },
            true
        );
    });

    useEffect(() => {
        groupRef.current?.add(healthBar);

        return () => {
            groupRef.current?.remove(healthBar);
        };
    }, []);

    useFrame(() => {
        healthBar.update();
    });

    useFrame((_, delta) => {
        if (!ref.current) return;
        const position = ref.current.translation();
        healthBar.position.set(position.x, position.y + 1, 0);
        const distance = Math.sqrt(
            position.x * position.x + position.y * position.y
        );

        lastTick.current += delta * 1000;

        if (distance > innerRadius) {
            // take damage every second
            if (lastTick.current > 1000) {
                healthBar.setHealth(healthBar.health - damagePerSecond);
                lastTick.current = 0;
            }
        }
    });

    return (
        <group ref={groupRef}>
            <RigidBody
                ref={ref}
                linearDamping={5}
                angularDamping={5}
                enabledRotations={[false, false, false]}
                colliders={false}
                enabledTranslations={[true, true, false]}
                userData={{
                    trail: trailRef.current,
                    healthBar: healthBar,
                }}
                mass={100}
            >
                {/* <group position={[0, -1, 0]} ref={trailRef}>
                <Trail isOn={forward} />
            </group> */}
                <ConvexHullCollider
                    args={[hitbox.getAttribute("position").array]}
                    rotation={[Math.PI / 2, Math.PI, 0]}
                />

                <Starship scale={[0.1, 0.1, 0.1]} isOn={forward} />
                {/* <mesh
                    rotation={[Math.PI / 2, Math.PI, 0]}
                    position={[0, 0, 0]}
                    visible={false}
                    >
                    <cylinderGeometry args={[0.8, 0.8, 5, 3]} />
                </mesh> */}
                <Turret />
            </RigidBody>
        </group>
    );
};

const hitbox = new CylinderGeometry(0.8, 0.8, 2, 3);
hitbox.scale(0.9, 1, 0.7);
