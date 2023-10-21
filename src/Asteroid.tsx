import {
    RapierContext,
    RapierRigidBody,
    RigidBody,
    useRapier,
} from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import {
    Color,
    CylinderGeometry,
    Euler,
    Mesh,
    MeshStandardMaterial,
    Quaternion,
    Vector3,
} from "three";
import { innerRadius } from "./Character/Character";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";

export class Asteroid extends Mesh {
    rigidbody: RapierRigidBody;
    collider: any;
    dead = false;
    constructor(
        public rapier: RapierContext,
        public speed = 2,
        public spawnRadius = 15,
        public minScale = 1,
        public maxScale = 3,
        public health = 100
    ) {
        const nbSides = Math.round(Math.random() * 30 + 7);
        const scale = Math.random() * (maxScale - minScale) + minScale;

        const points = [];
        for (let i = 0; i < nbSides; i++) {
            points.push(
                new Vector3(
                    (Math.random() - 0.5) * scale,
                    (Math.random() - 0.5) * scale,
                    (Math.random() - 0.5) * scale
                )
            );
        }

        const color = Math.random() / 2;

        super(
            // new CylinderGeometry(0.5 * scale, 0.5 * scale, 1 * scale, nbSides),
            new ConvexGeometry(points),
            new MeshStandardMaterial({ color: new Color(color, color, color) })
        );

        this.rotateX(Math.PI / 2);

        const spawnPoint = randomPointOnCircle(this.spawnRadius);
        this.position.set(spawnPoint.x, spawnPoint.y, 0);

        const destPoint = randomPointOnCircle(innerRadius);
        const direction = destPoint
            .sub(spawnPoint)
            .normalize()
            .multiplyScalar(this.speed);

        const rbDesc = this.rapier.rapier.RigidBodyDesc.dynamic()
            .setLinvel(direction.x, direction.y, 0)
            .setTranslation(this.position.x, this.position.y, 0)
            .enabledTranslations(true, true, false)
            .setUserData({ asteroid: this });
        this.rigidbody = this.rapier.world.createRigidBody(rbDesc);

        // const colliderDesc = this.rapier.rapier.ColliderDesc.cylinder(
        //     scale / 2,
        //     0.5 * scale
        // )
        const colliderDesc = this.rapier.rapier.ColliderDesc.convexHull(
            this.geometry.attributes.position.array as Float32Array
        )!
            .setTranslation(0, 0, 0)
            .setRotation(
                new Quaternion().setFromAxisAngle(
                    new Vector3(1, 0, 0),
                    Math.PI / 2
                )
            )
            .setActiveEvents(1);
        this.collider = this.rapier.world.createCollider(
            colliderDesc,
            this.rigidbody
        );

        this.rigidbody.addForce(direction, true);
        const max = 10;
        const randomTorqueVector = new Vector3(
            Math.random() * (max * 2) - max,
            Math.random() * (max * 2) - max,
            Math.random() * (max * 2) - max
        );
        this.rigidbody.applyTorqueImpulse(randomTorqueVector, true);
    }

    update(_delta: number) {
        if (this.dead) return;
        this.position.copy(this.rigidbody.translation() as Vector3);

        // delete object if too far from origin
        const distanceFromOrigin = this.position.length();
        if (distanceFromOrigin > 2 * innerRadius) {
            return this.destroy();
        }

        const rotation = this.rigidbody.rotation();
        const rot = new Quaternion(
            rotation.x,
            rotation.y,
            rotation.z,
            rotation.w
        );

        // offsets Math.PI / 2 to the model rotation
        this.quaternion.copy(
            rot.multiply(
                new Quaternion().setFromAxisAngle(
                    new Vector3(1, 0, 0),
                    Math.PI / 2
                )
            )
        );

        this.rotation.setFromQuaternion(rot);
    }

    dealDamage(damage: number) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
        }
    }

    destroy() {
        this.rapier.world.removeCollider(this.collider, false);
        this.rapier.world.removeRigidBody(this.rigidbody);
        this.rapier.rigidBodyStates.delete(this.rigidbody.handle);
        this.dead = true;
    }
}

const randomPointOnCircle = (radius: number) => {
    const angle = Math.random() * Math.PI * 2;

    return new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
};
