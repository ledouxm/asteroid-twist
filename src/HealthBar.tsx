import { useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import {
    Material,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    PlaneGeometry,
} from "three";

export const HealthBar = ({
    maxHealth = 100,
    health = 20,
}: {
    maxHealth?: number;
    health?: number;
}) => {
    const [healthBar] = useState(() => new HealthBarClass(maxHealth, health));

    useEffect(() => {
        healthBar.setHealth(health);
    }, [health]);

    useFrame(() => {
        healthBar.update();
    });
    return (
        <>
            <primitive object={healthBar} dispose={null} />
        </>
    );
};

export class HealthBarClass extends Object3D {
    background: Mesh;
    healthbar: Mesh;

    constructor(
        public maxHealth = 100,
        public health = 100,
        public width = 10,
        public height = 1
    ) {
        super();

        this.background = new Mesh(
            new PlaneGeometry(width, height),
            new MeshBasicMaterial({ color: "red" })
        );
        this.background.position.set(0, 0, 6);
        this.add(this.background);

        this.healthbar = new Mesh(
            new PlaneGeometry(width, height),
            new MeshBasicMaterial({ color: "green" })
        );
        this.healthbar.position.set(0, 0, 7);
        this.updateHealthbar();
        this.add(this.healthbar);
    }

    update() {
        this.updateHealthbar();
    }

    updateHealthbar() {
        const percentage = Math.max(this.health, 0) / this.maxHealth;

        this.healthbar.scale.set(percentage, 1, 1);
        this.healthbar.position.set(
            -this.width / 2 + (this.width * percentage) / 2,
            0,
            7
        );
    }

    setHealth(health: number) {
        this.health = health;
    }

    destroy() {
        this.background.geometry.dispose();
        this.healthbar.geometry.dispose();
        (this.background.material as Material).dispose();
        (this.healthbar.material as Material).dispose();

        this.remove(this.background);
        this.remove(this.healthbar);
    }
}
