import { useEffect, useRef, useState } from "react";
import {
    RigidBody,
    type RapierRigidBody,
    MeshCollider,
} from "@react-three/rapier";
import { Circle, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
    BoxGeometry,
    Group,
    Mesh,
    MeshStandardMaterial,
    PlaneGeometry,
    Quaternion,
    Vector2,
    Vector3,
} from "three";
import { useSpring } from "react-spring";
import { Controls } from "./App";
import { Turret } from "./Turret";

export const innerRadius = 10;
const moveSpeed = 100;
const rotationSpeed = 3;

const damagePerSecond = 5;

export const Character = () => {
    const ref = useRef<RapierRigidBody>(null);
    const lastTick = useRef(0);

    const [character] = useState(() => new CharacterClass());
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

    useFrame((_, delta) => {
        if (!ref.current) return;
        const position = ref.current.translation();
        const distance = Math.sqrt(
            position.x * position.x + position.y * position.y
        );

        lastTick.current += delta * 1000;

        if (distance > innerRadius) {
            // take damage every second
            if (lastTick.current > 1000) {
                character.dealDamage(damagePerSecond);
                lastTick.current = 0;
            }
        }
    });

    return (
        <RigidBody
            ref={ref}
            linearDamping={5}
            angularDamping={5}
            enabledRotations={[false, false, false]}
            colliders={false}
            enabledTranslations={[true, true, false]}
            userData={{
                trail: trailRef.current,
                character,
            }}
        >
            <group position={[0, -1, 0]} ref={trailRef}>
                <Trail isOn={forward} />
            </group>
            <MeshCollider type="cuboid">
                <primitive object={character} />
            </MeshCollider>
            <Turret />
        </RigidBody>
    );
};

class CharacterClass extends Mesh {
    health = 100;

    constructor() {
        super(new BoxGeometry(), new MeshStandardMaterial({ color: "white" }));
    }

    dealDamage(damage: number) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
        }
    }

    destroy() {
        this.visible = false;
    }
}

export const Trail = ({ isOn }: { isOn: boolean }) => {
    const ref = useRef<Mesh>(null);

    const size = useSpring({
        from: { x: 0.2 },
        to: { x: isOn ? 1 : 0.2 },
        config: {
            mass: 3,
            bounce: 0,
        },
    });

    useFrame(() => {
        ref.current?.scale.set(size.x.get(), 1, 1);
        ref.current?.position.set(0, 0.5 - size.x.get() / 2, 0);
    });

    return (
        <>
            <mesh rotation={[0, 0, -Math.PI / 2]} ref={ref} castShadow>
                <planeGeometry args={[1, 0.5]} />
                <meshStandardMaterial
                    color={"orange"}
                    transparent
                    opacity={0.7}
                    emissive={"yellow"}
                    emissiveIntensity={1}
                />
            </mesh>
        </>
    );
};
