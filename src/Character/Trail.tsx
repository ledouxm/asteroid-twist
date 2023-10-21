import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { useSpring } from "react-spring";
import trailFragmentShader from "../shaders/trail.frag";
import { TrailMaterial } from "./trailMaterial";

export const Trail = ({ isOn }: { isOn: boolean }) => {
    const ref = useRef<Mesh>(null);
    console.log(trailFragmentShader);

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
                <trailMaterial key={TrailMaterial.key} transparent />
                {/* <meshStandardMaterial
                color={"orange"}
                transparent
                opacity={0.7}
                emissive={"yellow"}
                emissiveIntensity={1}
            /> */}
            </mesh>
        </>
    );
};
