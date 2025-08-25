<script lang="ts">
    import { onMount } from 'svelte';
    import * as THREE from 'three';

    let { isMobile } = $props();

    let container: HTMLDivElement;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let animationId: number;
    let isVisible = true;

    // Animation objects
    let spheres: THREE.Mesh[] = [];
    let icosahedronVertices: THREE.Vector3[] = [];
    let time = 0;
    let isDarkMode = true;
    let themeObserver: MutationObserver | null = null;

    // Shared low-poly geometry
    let sharedGeometry: THREE.SphereGeometry | null = null;

    // Dithering shader material
    const ditherVertexShader = `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;

        void main() {
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const ditherFragmentShader = `
        uniform float time;
        uniform vec3 color;
        uniform float ditherScale;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;

        float dither4x4(vec2 position, float brightness) {
            int x = int(mod(position.x, 4.0));
            int y = int(mod(position.y, 4.0));
            int index = x + y * 4;
            float limit = 0.0;
            if (index == 0) limit = 0.0625;
            if (index == 1) limit = 0.5625;
            if (index == 2) limit = 0.1875;
            if (index == 3) limit = 0.6875;
            if (index == 4) limit = 0.8125;
            if (index == 5) limit = 0.3125;
            if (index == 6) limit = 0.9375;
            if (index == 7) limit = 0.4375;
            if (index == 8) limit = 0.25;
            if (index == 9) limit = 0.75;
            if (index == 10) limit = 0.125;
            if (index == 11) limit = 0.625;
            if (index == 12) limit = 1.0;
            if (index == 13) limit = 0.5;
            if (index == 14) limit = 0.875;
            if (index == 15) limit = 0.375;
            return brightness < limit ? 0.0 : 1.0;
        }

        void main() {
            vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
            float NdotL = dot(vNormal, lightDir);
            float brightness = (NdotL + 1.0) * 0.5;
            brightness += sin(time * 2.0 + vPosition.x * 0.1) * 0.15;
            brightness += cos(time * 1.5 + vPosition.y * 0.1) * 0.08;

            vec2 ditherCoord = gl_FragCoord.xy * ditherScale;
            float dithered = dither4x4(ditherCoord, brightness);
            gl_FragColor = vec4(color * dithered, 1.0);
        }
    `;

    function createDitheredMaterial(color: THREE.Color, ditherScale = 1.0) {
        return new THREE.ShaderMaterial({
            vertexShader: ditherVertexShader,
            fragmentShader: ditherFragmentShader,
            uniforms: {
                time: { value: 0 },
                color: { value: color },
                ditherScale: { value: ditherScale }
            }
        });
    }

    function createIcosahedronVertices() {
        const phi = (1 + Math.sqrt(5)) / 2;
        const vertices = [
            [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
            [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
            [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
        ];
        const scaleX = window.innerWidth * 0.025;
        const scaleY = window.innerHeight * 0.025;
        const scaleZ = Math.max(scaleX, scaleY) * 0.8;
        return vertices.map((v) => new THREE.Vector3(v[0] * scaleX, v[1] * scaleY, v[2] * scaleZ));
    }

    function updateThemeColors() {
        isDarkMode = !document.body.classList.contains('light-mode');
        for (const sphere of spheres) {
            const mat = sphere.material as THREE.ShaderMaterial;
            const base: number = sphere.userData.baseBrightness;
            const brightness = isDarkMode ? 0.45 + base * 0.5 : 0.4 + (1.0 - base) * 0.3;
            mat.uniforms.color.value.setScalar(brightness);
        }
    }

    function animate() {
        if (!isVisible) return;
        time += 0.016;
        animationId = requestAnimationFrame(animate);

        for (const sphere of spheres) {
            const mat = sphere.material as THREE.ShaderMaterial;
            mat.uniforms.time.value = time;

            const u = sphere.userData;
            const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
                new THREE.Euler(time * 0.06, time * 0.05, time * 0.04)
            );
            const rotatedTarget = u.targetVertex.clone().applyMatrix4(rotationMatrix);

            const orbitAngle = time * u.orbitSpeed * 0.7 + u.orbitPhase;
            const orbitX = Math.cos(orbitAngle) * u.orbitRadius;
            const orbitY = Math.sin(orbitAngle) * u.orbitRadius;
            const orbitZ = Math.sin(orbitAngle * 0.7) * u.orbitRadius * 0.5;

            const noiseX = Math.sin(time * 0.4 + u.noiseOffsetX) * u.noiseScale +
                           Math.sin(time * 0.8 + u.noiseOffsetX * 2.0) * (u.noiseScale * 0.3);
            const noiseY = Math.cos(time * 0.5 + u.noiseOffsetY) * u.noiseScale +
                           Math.cos(time * 0.7 + u.noiseOffsetY * 1.7) * (u.noiseScale * 0.4);
            const noiseZ = Math.sin(time * 0.3 + u.noiseOffsetZ) * u.noiseScale +
                           Math.cos(time * 0.6 + u.noiseOffsetZ * 1.3) * (u.noiseScale * 0.25);

            sphere.position.set(
                rotatedTarget.x + orbitX + noiseX,
                rotatedTarget.y + orbitY + noiseY,
                rotatedTarget.z + orbitZ + noiseZ
            );
            sphere.rotation.set(
                time * 0.12 + orbitAngle * 0.08 + noiseX * 0.08,
                time * 0.10 + orbitAngle * 0.10 + noiseY * 0.08,
                time * 0.14 + orbitAngle * 0.04 + noiseZ * 0.08
            );
        }

        const baseCameraDistance = Math.max(window.innerWidth, window.innerHeight) * 0.08;
        camera.position.x = Math.sin(time * 0.005) * (baseCameraDistance * 0.3);
        camera.position.y = Math.cos(time * 0.004) * (baseCameraDistance * 0.2);
        camera.position.z = baseCameraDistance + Math.sin(time * 0.002) * (baseCameraDistance * 0.1);
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

        icosahedronVertices = createIcosahedronVertices();
        spheres.forEach((sphere, index) => {
            const targetVertex = icosahedronVertices[index % icosahedronVertices.length];
            sphere.userData.targetVertex = targetVertex.clone();
            sphere.userData.noiseScale = Math.min(window.innerWidth, window.innerHeight) * (0.006 + Math.random() * 0.014);
            sphere.userData.orbitRadius = Math.min(window.innerWidth, window.innerHeight) * (0.006 + Math.random() * 0.012);
        });
    }

    onMount(() => {
        // Three setup
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, Math.max(window.innerWidth, window.innerHeight) * 0.08);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        const targetDpr = 1.0;
        renderer.setPixelRatio(targetDpr);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Shared geometry once
        sharedGeometry = new THREE.SphereGeometry(1, 12, 10);

        // Scaffold
        icosahedronVertices = createIcosahedronVertices();
        isDarkMode = !document.body.classList.contains('light-mode');

        const numSpheres = isMobile ? 80 : 120;
        let spheresAddedCount = 0;
        const spheresPerFrame = 5; // Adjust this value to control the speed of loading

        function addSphereBatch() {
            const batchEnd = Math.min(spheresAddedCount + spheresPerFrame, numSpheres);
            for (let i = spheresAddedCount; i < batchEnd; i++) {
                const baseBrightness = 0.2 + Math.random() * 0.6;
                const brightness = isDarkMode ? 0.45 + baseBrightness * 0.5 : 0.4 + (1.0 - baseBrightness) * 0.3;
                const color = new THREE.Color(brightness, brightness, brightness);
                const ditherScale = 0.6 + Math.random() * 0.8;

                const mat = createDitheredMaterial(color, ditherScale);
                const mesh = new THREE.Mesh(sharedGeometry, mat);
                const scale = 0.08 + Math.random() * 0.25;
                mesh.scale.setScalar(scale);

                const targetVertex = icosahedronVertices[i % icosahedronVertices.length];
                mesh.userData = {
                    targetVertex: targetVertex.clone(),
                    noiseOffsetX: Math.random() * 10,
                    noiseOffsetY: Math.random() * 10,
                    noiseOffsetZ: Math.random() * 10,
                    noiseScale: Math.min(window.innerWidth, window.innerHeight) * (0.006 + Math.random() * 0.014),
                    orbitRadius: Math.min(window.innerWidth, window.innerHeight) * (0.006 + Math.random() * 0.012),
                    orbitSpeed: 0.12 + Math.random() * 0.22,
                    orbitPhase: Math.random() * Math.PI * 2,
                    baseBrightness
                };

                spheres.push(mesh);
                scene.add(mesh);
            }
            spheresAddedCount = batchEnd;

            if (spheresAddedCount < numSpheres) {
                requestAnimationFrame(addSphereBatch);
            } else {
                // All spheres added, start animation if not already started
                if (!animationId) {
                    animate();
                }
            }
        }

        // Start adding spheres
        addSphereBatch();

        // Animate
        animate();

        // Events
        window.addEventListener('resize', handleResize);
        const onVisibilityChange = () => {
            isVisible = document.visibilityState === 'visible';
            if (isVisible) {
                cancelAnimationFrame(animationId);
                animate();
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        themeObserver = new MutationObserver(updateThemeColors);
        themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            themeObserver?.disconnect();
            spheres.forEach((s) => (s.material as THREE.Material).dispose());
            if (sharedGeometry) sharedGeometry.dispose();
            if (container && renderer.domElement.parentNode === container) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    });
</script>

<div class="dithered-grid-bg"></div>
<div bind:this={container}></div>

<style>
    .dithered-grid-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100dvw;
        height: 100dvh;
        z-index: -2; /* Behind everything */
        pointer-events: none;
        background-color: var(--bg);

        /* Retro terminal grid: minor + major lines */
        --grid-minor: rgba(255, 255, 255, 0.06);
        --grid-major: rgba(255, 255, 255, 0.12);

        background-image:
            /* minor vertical */
            linear-gradient(to right, var(--grid-minor) 1px, transparent 1px),
            /* minor horizontal */
            linear-gradient(to bottom, var(--grid-minor) 1px, transparent 1px),
            /* major vertical */
            linear-gradient(to right, var(--grid-major) 1px, transparent 1px),
            /* major horizontal */
            linear-gradient(to bottom, var(--grid-major) 1px, transparent 1px);
        
        /* spacing driven by --grid: minor = var(--grid), major = 4x */
        background-size:
            var(--grid) 100%,
            100% var(--grid),
            calc(var(--grid) * 4) 100%,
            100% calc(var(--grid) * 4);
        background-position:
            0 0,
            0 0,
            0 0,
            0 0;
    }

	/* Light mode adjustments for dithered grid */
    :global(.light-mode) .dithered-grid-bg {
        --grid-minor: rgba(0, 0, 0, 0.08);
        --grid-major: rgba(0, 0, 0, 0.16);
    }

	div:not(.dithered-grid-bg) {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: -1; /* Spheres container in front of grid but behind content */
	}

	:global(canvas) {
		display: block !important;
		background: transparent !important;
	}
</style>
