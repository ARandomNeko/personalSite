<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	let { isMobile } = $props();

	let container: HTMLDivElement;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let animationId: number;

	// Animation objects
	let spheres: THREE.Mesh[] = [];
	let icosahedronVertices: THREE.Vector3[] = [];
	let time = 0;
	let isDarkMode = true;

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

		// Dithering matrix
		float dither4x4(vec2 position, float brightness) {
			int x = int(mod(position.x, 4.0));
			int y = int(mod(position.y, 4.0));
			int index = x + y * 4;
			float limit = 0.0;

			if (x < 8) {
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
			}

			return brightness < limit ? 0.0 : 1.0;
		}

		void main() {
			vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
			float NdotL = dot(vNormal, lightDir);
			float brightness = (NdotL + 1.0) * 0.5;
			
			// Add some animation
			brightness += sin(time * 2.0 + vPosition.x * 0.1) * 0.2;
			brightness += cos(time * 1.5 + vPosition.y * 0.1) * 0.1;
			
			vec2 ditherCoord = gl_FragCoord.xy * ditherScale;
			float dithered = dither4x4(ditherCoord, brightness);
			
			gl_FragColor = vec4(color * dithered, 1.0);
		}
	`;

	const createDitheredMaterial = (color: THREE.Color, ditherScale = 1.0) => {
		return new THREE.ShaderMaterial({
			vertexShader: ditherVertexShader,
			fragmentShader: ditherFragmentShader,
			uniforms: {
				time: { value: 0 },
				color: { value: color },
				ditherScale: { value: ditherScale }
			}
		});
	};

	const createSphere = (
		radius: number,
		position: THREE.Vector3,
		color: THREE.Color,
		ditherScale: number
	) => {
		const geometry = new THREE.SphereGeometry(radius, 32, 32);
		const material = createDitheredMaterial(color, ditherScale);
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.copy(position);
		return mesh;
	};

	// Create icosahedron vertices that fill the screen
	const createIcosahedronVertices = () => {
		const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
		const vertices = [
			// 4 vertices on each of 3 perpendicular rectangles
			[-1, phi, 0],
			[1, phi, 0],
			[-1, -phi, 0],
			[1, -phi, 0],
			[0, -1, phi],
			[0, 1, phi],
			[0, -1, -phi],
			[0, 1, -phi],
			[phi, 0, -1],
			[phi, 0, 1],
			[-phi, 0, -1],
			[-phi, 0, 1]
		];

		// Scale to fill screen dimensions
		const scaleX = window.innerWidth * 0.025; // Scale based on screen width
		const scaleY = window.innerHeight * 0.025; // Scale based on screen height
		const scaleZ = Math.max(scaleX, scaleY) * 0.8; // Depth scaling

		return vertices.map((v) => new THREE.Vector3(v[0] * scaleX, v[1] * scaleY, v[2] * scaleZ));
	};

	// Check theme mode
	const checkTheme = () => {
		const newDarkMode = !document.body.classList.contains('light-mode');
		
		// Only update colors if theme actually changed
		if (newDarkMode !== isDarkMode) {
			isDarkMode = newDarkMode;
			
			// Update sphere colors based on theme
			spheres.forEach((sphere) => {
				const material = sphere.material as THREE.ShaderMaterial;
				const baseBrightness = sphere.userData.baseBrightness;
				
				let brightness;
				if (isDarkMode) {
					// Dark mode: white/bright spheres (like white text on dark background)
					brightness = 0.3 + baseBrightness * 0.7; // Bright spheres in dark mode
				} else {
					// Light mode: dark spheres (like dark text on light background)
					brightness = (1.0 - baseBrightness) * 0.6; // Dark spheres in light mode
				}
				
				material.uniforms.color.value.setRGB(brightness, brightness, brightness);
			});
		}
	};

	const animate = () => {
		time += 0.016;
		animationId = requestAnimationFrame(animate);

		// Check for theme changes
		checkTheme();

		// Update shader uniforms and noisy icosahedron movement
		spheres.forEach((sphere, index) => {
			const material = sphere.material as THREE.ShaderMaterial;
			material.uniforms.time.value = time;

			const userData = sphere.userData;

			// Rotate the entire icosahedron structure slowly
			const rotationMatrix = new THREE.Matrix4();
			rotationMatrix.makeRotationFromEuler(new THREE.Euler(time * 0.06, time * 0.05, time * 0.04));

			// Get the current rotated target vertex
			const rotatedTarget = userData.targetVertex.clone();
			rotatedTarget.applyMatrix4(rotationMatrix);

			// Add orbital motion around the vertex
			const orbitAngle = time * userData.orbitSpeed * 0.7 + userData.orbitPhase;
			const orbitX = Math.cos(orbitAngle) * userData.orbitRadius;
			const orbitY = Math.sin(orbitAngle) * userData.orbitRadius;
			const orbitZ = Math.sin(orbitAngle * 0.7) * userData.orbitRadius * 0.5;

			// Add complex noise for organic, non-geometric feel
			const noiseX =
				Math.sin(time * 0.4 + userData.noiseOffsetX) * userData.noiseScale +
				Math.sin(time * 0.8 + userData.noiseOffsetX * 2) * (userData.noiseScale * 0.3);
			const noiseY =
				Math.cos(time * 0.5 + userData.noiseOffsetY) * userData.noiseScale +
				Math.cos(time * 0.7 + userData.noiseOffsetY * 1.7) * (userData.noiseScale * 0.4);
			const noiseZ =
				Math.sin(time * 0.3 + userData.noiseOffsetZ) * userData.noiseScale +
				Math.cos(time * 0.6 + userData.noiseOffsetZ * 1.3) * (userData.noiseScale * 0.25);

			// Combine target position + orbit + noise
			sphere.position.x = rotatedTarget.x + orbitX + noiseX;
			sphere.position.y = rotatedTarget.y + orbitY + noiseY;
			sphere.position.z = rotatedTarget.z + orbitZ + noiseZ;

			// Rotation follows the movement
			sphere.rotation.x = time * 0.12 + orbitAngle * 0.08 + noiseX * 0.08;
			sphere.rotation.y = time * 0.1 + orbitAngle * 0.1 + noiseY * 0.08;
			sphere.rotation.z = time * 0.14 + orbitAngle * 0.04 + noiseZ * 0.08;
		});

		// Camera positioned to view the full-screen icosahedron structure
		const baseCameraDistance = Math.max(window.innerWidth, window.innerHeight) * 0.08;
		camera.position.x = Math.sin(time * 0.005) * (baseCameraDistance * 0.3);
		camera.position.y = Math.cos(time * 0.004) * (baseCameraDistance * 0.2);
		camera.position.z = baseCameraDistance + Math.sin(time * 0.002) * (baseCameraDistance * 0.1);
		camera.lookAt(0, 0, 0); // Look at the center of the screen-wide structure

		renderer.render(scene, camera);
	};

	const handleResize = () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);

		// Recreate icosahedron vertices for new screen size
		icosahedronVertices = createIcosahedronVertices();

		// Update all sphere properties for new screen size
		spheres.forEach((sphere, index) => {
			const targetVertex = icosahedronVertices[index % icosahedronVertices.length];
			sphere.userData.targetVertex = targetVertex.clone();
			sphere.userData.noiseScale =
				Math.min(window.innerWidth, window.innerHeight) * 0.01 +
				Math.random() * (Math.min(window.innerWidth, window.innerHeight) * 0.02);
			sphere.userData.orbitRadius =
				Math.min(window.innerWidth, window.innerHeight) * 0.008 +
				Math.random() * (Math.min(window.innerWidth, window.innerHeight) * 0.015);
		});
	};

	onMount(() => {
		// Initialize Three.js scene
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.set(0, 0, Math.max(window.innerWidth, window.innerHeight) * 0.08);

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x000000, 0); // Fully transparent background
		container.appendChild(renderer.domElement);

		// Create icosahedron vertices that fill the screen
		icosahedronVertices = createIcosahedronVertices();

		// Check initial theme
		isDarkMode = !document.body.classList.contains('light-mode');

		const numSpheres = isMobile ? 250 : 500;

		// Create numSpheres that will follow the icosahedron structure with noise
		for (let i = 0; i < numSpheres; i++) {
			// Varied sphere properties
			const radius = 0.1 + Math.random() * 0.2; // Bigger random sizes
			const baseBrightness = 0.2 + Math.random() * 0.6; // Random brightness for variety
			
			// Adjust brightness based on theme
			const brightness = isDarkMode ? 0.3 + baseBrightness * 0.7 : (1.0 - baseBrightness) * 0.6;
			const color = new THREE.Color(brightness, brightness, brightness); // Pure black and white
			const ditherScale = 0.6 + Math.random() * 0.8; // Varied dithering

			const sphere = createSphere(radius, new THREE.Vector3(0, 0, 0), color, ditherScale);

			// Assign each sphere to follow one of the icosahedron vertices (with multiple spheres per vertex)
			const targetVertex = icosahedronVertices[i % icosahedronVertices.length];
			sphere.userData = {
				targetVertex: targetVertex.clone(),
				noiseOffsetX: Math.random() * 10,
				noiseOffsetY: Math.random() * 10,
				noiseOffsetZ: Math.random() * 10,
				noiseScale:
					Math.min(window.innerWidth, window.innerHeight) * 0.01 +
					Math.random() * (Math.min(window.innerWidth, window.innerHeight) * 0.02), // Screen-relative noise
				orbitRadius:
					Math.min(window.innerWidth, window.innerHeight) * 0.008 +
					Math.random() * (Math.min(window.innerWidth, window.innerHeight) * 0.015), // Screen-relative orbit
				orbitSpeed: 0.15 + Math.random() * 0.25, // Slower orbit speeds
				orbitPhase: Math.random() * Math.PI * 2,
				baseBrightness: baseBrightness // Store original brightness for theme switching
			};

			spheres.push(sphere);
			scene.add(sphere);
		}

		// Start animation
		animate();

		// Handle window resize
		window.addEventListener('resize', handleResize);

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', handleResize);
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
		width: 100vw;
		height: 100vh;
		z-index: -2; /* Behind everything */
		background-color: var(--bg);
		background-image:
			radial-gradient(circle at 0.25px 0.25px, rgba(255, 255, 255, 0.4) 0.25px, transparent 0),
			radial-gradient(circle at 0.5px 0.5px, rgba(255, 255, 255, 0.2) 0.25px, transparent 0),
			radial-gradient(circle at 0.75px 0.75px, rgba(255, 255, 255, 0.1) 0.25px, transparent 0);
		background-size:
			1px 1px,
			2px 2px,
			3px 3px;
		opacity: 0.5; /* Dark mode default - white dots for contrast */
	}

	/* Light mode adjustments for dithered grid */
	:global(.light-mode) .dithered-grid-bg {
		background-image:
			radial-gradient(circle at 0.25px 0.25px, rgba(0, 0, 0, 0.6) 0.25px, transparent 0),
			radial-gradient(circle at 0.5px 0.5px, rgba(0, 0, 0, 0.4) 0.25px, transparent 0),
			radial-gradient(circle at 0.75px 0.75px, rgba(0, 0, 0, 0.2) 0.25px, transparent 0);
		opacity: 0.4; /* Light mode - dark dots for contrast */
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
