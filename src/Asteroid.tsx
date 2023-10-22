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
    Group,
    Mesh,
    MeshStandardMaterial,
    Quaternion,
    Vector3,
} from "three";
import { innerRadius } from "./Character/Character";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import { HealthBarClass } from "./HealthBar";

export class Asteroid extends Group {
    mesh: Mesh;
    rigidbody: RapierRigidBody;
    collider: any;
    dead = false;
    healthBar: HealthBarClass;

    constructor(
        public rapier: RapierContext,
        public speed = 2,
        public spawnRadius = 15,
        public minScale = 1,
        public maxScale = 3,
        public health = 100
    ) {
        super();
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

        this.mesh = new Mesh(
            // new CylinderGeometry(0.5 * scale, 0.5 * scale, 1 * scale, nbSides),
            new ConvexGeometry(points),
            new MeshStandardMaterial({
                color: new Color(color, color, color),
            })
        );

        this.add(this.mesh);

        // this.rotateX(Math.PI / 2);

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

        const colliderDesc = this.rapier.rapier.ColliderDesc.convexHull(
            this.mesh.geometry.getAttribute("position")!.array as Float32Array
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

        this.healthBar = new HealthBarClass(health, health, 5, 0.5);
        this.add(this.healthBar);
    }

    update(_delta: number) {
        this.healthBar.update();

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
        this.mesh.quaternion.copy(
            rot.multiply(
                new Quaternion().setFromAxisAngle(
                    new Vector3(1, 0, 0),
                    Math.PI / 2
                )
            )
        );

        this.mesh.rotation.setFromQuaternion(rot);
    }

    dealDamage(damage: number) {
        this.healthBar.setHealth(this.healthBar.health - damage);
        if (this.healthBar.health <= 0) {
            this.destroy();
        }
    }

    destroy() {
        this.rapier.world.removeCollider(this.collider, false);
        this.rapier.world.removeRigidBody(this.rigidbody);
        this.rapier.rigidBodyStates.delete(this.rigidbody.handle);

        this.removeFromParent();

        this.dead = true;
    }
}

const randomPointOnCircle = (radius: number) => {
    const angle = Math.random() * Math.PI * 2;

    return new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
};
