import { extend, useFrame } from "@react-three/fiber";
import { Object3D } from "three";
import { Asteroid } from "./Asteroid";
import { RapierContext, useRapier } from "@react-three/rapier";
import { useRef } from "react";

export class AsteroidSpawnerClass extends Object3D {
    lastSpawn = 0;
    current = 0;
    asteroids = new Set<Asteroid>();
    constructor(public interval: number = 500, public rapier: RapierContext) {
        super();
        console.log(this);
    }

    spawnAsteroid() {
        const asteroid = new Asteroid(this.rapier, undefined, undefined, 3, 5);
        this.asteroids.add(asteroid);
        this.add(asteroid);
    }

    update(delta: number) {
        this.current += delta;
        this.asteroids.forEach((asteroid) => {
            asteroid.update(delta);
            if (asteroid.dead) {
                this.remove(asteroid);
                this.asteroids.delete(asteroid);
            }
        });

        if (this.current - this.lastSpawn > this.interval) {
            this.lastSpawn = this.current;

            this.spawnAsteroid();
        }
    }
}

export const AsteroidSpawner = () => {
    const ref = useRef<AsteroidSpawnerClass>(null);
    const rapier = useRapier();

    useFrame((_, delta) => {
        ref.current?.update(delta * 1000);
    });

    return <asteroidSpawnerClass ref={ref} rapier={rapier} interval={2000} />;
};

extend({ AsteroidSpawnerClass });

declare global {
    namespace JSX {
        interface IntrinsicElements {
            asteroidSpawnerClass: any;
        }
    }
}
