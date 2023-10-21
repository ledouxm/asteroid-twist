import {
    RapierCollider,
    RapierContext,
    RapierRigidBody,
} from "@react-three/rapier";
import {
    BoxGeometry,
    Mesh,
    MeshStandardMaterial,
    Quaternion,
    Vector3,
} from "three";
import { Asteroid } from "./Asteroid";

export class Bullet extends Mesh {
    rigidbody: RapierRigidBody;
    collider: RapierCollider;
    dead = false;
    constructor(
        public rapier: RapierContext,
        public initialPosition: Vector3,
        public initialQuaternion: Quaternion,
        public config = {
            speed: 50,
            maxRange: 15,
            damage: 50,
            size: 0.1,
            color: "red",
        }
    ) {
        super(
            new BoxGeometry(config.size, 0.3, 2),
            new MeshStandardMaterial({ color: config.color })
        );
        this.rotation.setFromQuaternion(this.initialQuaternion);

        const rbDesc = this.rapier.rapier.RigidBodyDesc.dynamic()
            .setTranslation(initialPosition.x, initialPosition.y, 0)
            .enabledTranslations(true, true, false)
            .enabledRotations(false, false, false);

        this.rigidbody = this.rapier.world.createRigidBody(rbDesc);

        const colliderDesc = this.rapier.rapier.ColliderDesc.cuboid(
            config.size / 2,
            0.3 / 2,
            10 / 2
        )
            .setRotation(initialQuaternion)
            .setTranslation(0, 0, 0)
            .setActiveEvents(rapier.rapier.ActiveEvents.COLLISION_EVENTS);

        this.collider = this.rapier.world.createCollider(
            colliderDesc,
            this.rigidbody
        );

        const force = new Vector3(0, 1, 0);
        force.applyQuaternion(initialQuaternion);
        force.normalize();
        force.multiplyScalar(config.speed / 10);

        this.rigidbody.applyImpulse(
            {
                x: force.x,
                y: force.y,
                z: force.z,
            },
            true
        );
    }

    update(_delta: number) {
        if (this.dead) return;
        this.position.copy(this.rigidbody.translation() as Vector3);

        const traveled = this.initialPosition.distanceTo(this.position);
        if (traveled > this.config.maxRange) {
            return this.destroy();
        }

        this.rapier.world.contactsWith(this.collider, (handle) => {
            const asteroid = (handle.parent()?.userData as any)
                .asteroid as unknown as Asteroid;
            if (!asteroid) return;
            asteroid.dealDamage(this.config.damage);

            this.destroy();
        });
    }

    destroy() {
        this.rapier.world.removeCollider(this.collider, false);
        this.rapier.world.removeRigidBody(this.rigidbody);
        this.rapier.rigidBodyStates.delete(this.rigidbody.handle);
        this.dead = true;
    }
}
