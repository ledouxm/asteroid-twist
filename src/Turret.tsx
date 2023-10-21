import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group, Mesh, Quaternion, Vector3 } from "three";
import { Controls } from "./App";
import { Bullet } from "./Bullet";
import { useRapier } from "@react-three/rapier";

const fireRate = 500;

export const Turret = () => {
    const ref = useRef<Group>(null);
    const bulletStartRef = useRef<Mesh>(null);

    const fire = useKeyboardControls<Controls>((state) => state.jump);
    const lastBulletTime = useRef(0);
    const bulletsSet = useRef(new Set<Bullet>());

    const rapier = useRapier();
    const { scene } = useThree();

    useFrame(({ scene, camera, mouse, raycaster }) => {
        if (!ref.current) return;
        const character = ref.current.parent!;
        const characterRotationAngle = character.rotation.z;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(
            scene.getObjectByName("ground")!,
            true
        );

        if (intersects.length === 0) return;
        const dest = intersects[0].point;

        // apply character rotation and rotate mesh
        const direction = dest.sub(character.position).normalize();
        const angle = Math.atan2(direction.y, direction.x);
        ref.current.parent!.userData.angle = angle;
        ref.current.rotation.z = angle - characterRotationAngle - Math.PI / 2;
    });

    const fireBullet = () => {
        const position = bulletStartRef.current!.getWorldPosition(
            new Vector3()
        );
        const quaternion = bulletStartRef.current!.getWorldQuaternion(
            new Quaternion()
        );
        const bullet = new Bullet(rapier, position, quaternion);
        bulletsSet.current.add(bullet);
        scene.add(bullet);
    };

    useFrame((_, delta) => {
        if (fire && Date.now() - lastBulletTime.current > fireRate) {
            lastBulletTime.current = Date.now();
            fireBullet();
        }

        bulletsSet.current.forEach((bullet) => {
            bullet.update(delta);
            if (bullet.dead) {
                bulletsSet.current.delete(bullet);
                scene.remove(bullet);
            }
        });
    });

    return (
        <group position={[0, 0, 0.5]} ref={ref}>
            <mesh>
                <sphereGeometry args={[0.4]} />
                <meshStandardMaterial color="red" />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.5]} />
                <meshStandardMaterial color="blue" />
            </mesh>
            <mesh position={[0, 0.8, 1]} visible={false} ref={bulletStartRef}>
                <sphereGeometry args={[0.1]} />
            </mesh>
        </group>
    );
};
