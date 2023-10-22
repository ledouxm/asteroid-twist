import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import {
    Circle,
    KeyboardControls,
    OrbitControls,
    Stars,
} from "@react-three/drei";
import { Character, innerRadius } from "./Character/Character";
import "./AsteroidSpawner";
import { AsteroidSpawner } from "./AsteroidSpawner";
import { NodeToyTick } from "@nodetoy/react-nodetoy";
import { Suspense } from "react";
import { EffectComposer, Bloom, SSAO } from "@react-three/postprocessing";

function App() {
    return (
        <>
            <KeyboardControls map={keyboardControlsMap}>
                <Canvas
                    orthographic
                    camera={{ zoom: 40, position: [0, 0, 100] }}
                    shadows
                >
                    <ambientLight />
                    {/* <pointLight position={[0, 0, 10]} intensity={50} /> */}
                    <directionalLight position={[0, 0, 10]} intensity={1} />
                    <Physics gravity={[0, 0, 0]}>
                        <Character />
                        <AsteroidSpawner />
                    </Physics>
                    <OrbitControls />
                    <Circle args={[innerRadius, 64]} position={[0, 0, -50]}>
                        <meshBasicMaterial color="#222" />
                    </Circle>
                    <mesh
                        rotation={[0, 0, 0]}
                        position={[0, 0, -51]}
                        name="ground"
                        visible={false}
                    >
                        <planeGeometry args={[100, 100]} />
                        <meshStandardMaterial color="black" />
                    </mesh>
                    <Stars />
                    <NodeToyTick />
                    <Suspense fallback={null}>
                        <EffectComposer>
                            <Bloom mipmapBlur luminanceThreshold={1} />
                        </EffectComposer>
                    </Suspense>
                </Canvas>
            </KeyboardControls>
        </>
    );
}

export enum Controls {
    forward = "forward",
    backward = "backward",
    left = "left",
    right = "right",
    jump = "jump",
}

const keyboardControlsMap = [
    { keys: ["KeyW"], name: Controls.forward },
    { keys: ["KeyS"], name: Controls.backward },
    { keys: ["KeyA"], name: Controls.left },
    { keys: ["KeyD"], name: Controls.right },
    { keys: ["Space"], name: Controls.jump },
];

export default App;
