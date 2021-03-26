import * as THREE from 'three'

export default function (scene) {
    const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
    const overlayMaterial = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
            uAlpha: { value: 1 },
        },
        vertexShader: `

            void main()
            {
                // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                // vec4 viewPosition = viewMatrix * modelPosition;
                // vec4 projectedPosition = projectionMatrix * viewPosition;

                // vec4 pos = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                vec4 pos = vec4(position,1.0);

                gl_Position = pos;
            }
        `,
        fragmentShader: `

        uniform float uAlpha;

        void main()
        {
            vec4 color = vec4(0.0,0.0,0.0,uAlpha);

            gl_FragColor = vec4(color);
        }

        `,
    })
    const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
    scene.add(overlay)

    return overlay
}
