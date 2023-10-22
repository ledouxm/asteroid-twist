import { NodeToyMaterial } from "@nodetoy/react-nodetoy";
import shaderData from "../shaders/trail.json";

export const TrailMaterial = () => <NodeToyMaterial data={shaderData} />;
