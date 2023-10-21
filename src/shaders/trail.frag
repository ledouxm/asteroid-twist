varying vec2 vUv;

void main() {
    float value = 0.8 - abs(vUv.y - 0.5);
    gl_FragColor = vec4(value, value, 0.0, value);
}
