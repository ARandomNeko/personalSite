<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	let { isMobile } = $props();

	let container: HTMLDivElement = $state(null!);
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let animationId: number;
	let isVisible = true;
	let prefersReducedMotion = $state(false);

	// Animation objects
	let spheres: THREE.Mesh[] = [];
	let icosahedronVertices: THREE.Vector3[] = [];
	let time = 0;
	let isDarkMode = true;
	let themeObserver: MutationObserver | null = null;

	// Shared low-poly geometry
	let sharedGeometry: THREE.SphereGeometry | null = null;

	// Smoothed values for interpolation
	let smoothMouseX = 0;
	let smoothMouseY = 0;
	let smoothScroll = 0;

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
		if (!isVisible || prefersReducedMotion) return;
		time += 0.016;
		animationId = requestAnimationFrame(animate);

		// Smooth interpolation for mouse and scroll
		const lerpFactor = 0.05;
		smoothMouseX += (mousePosition.x - smoothMouseX) * lerpFactor;
		smoothMouseY += (mousePosition.y - smoothMouseY) * lerpFactor;
		smoothScroll += (scrollProgress - smoothScroll) * lerpFactor;

		// Scroll affects the overall rotation of the scaffold
		const scrollRotation = smoothScroll * Math.PI * 0.5;

		for (const sphere of spheres) {
			const mat = sphere.material as THREE.ShaderMaterial;
			mat.uniforms.time.value = time;

			const u = sphere.userData;
			
			// Base rotation plus scroll-influenced rotation
			const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
				new THREE.Euler(
					time * 0.06 + scrollRotation * 0.3,
					time * 0.05 + scrollRotation * 0.2,
					time * 0.04
				)
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

			// Mouse parallax effect - spheres shift based on their depth (z position)
			const depthFactor = (u.targetVertex.z + 50) / 100; // Normalize depth
			const mouseInfluenceX = smoothMouseX * 15 * depthFactor;
			const mouseInfluenceY = smoothMouseY * 15 * depthFactor;

			sphere.position.set(
				rotatedTarget.x + orbitX + noiseX + mouseInfluenceX,
				rotatedTarget.y + orbitY + noiseY + mouseInfluenceY,
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
		if (prefersReducedMotion) return;
		
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
		// Check for reduced motion preference
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		
		// Listen for changes to reduced motion preference
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const handleMotionChange = (e: MediaQueryListEvent) => {
			prefersReducedMotion = e.matches;
			if (prefersReducedMotion) {
				cancelAnimationFrame(animationId);
				// Hide spheres
				spheres.forEach(s => s.visible = false);
			} else {
				spheres.forEach(s => s.visible = true);
				animate();
			}
		};
		motionQuery.addEventListener('change', handleMotionChange);

		// If reduced motion, only show static grid
		if (prefersReducedMotion) {
			return () => {
				motionQuery.removeEventListener('change', handleMotionChange);
			};
		}

		// Three setup
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.set(0, 0, Math.max(window.innerWidth, window.innerHeight) * 0.08);

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		const targetDpr = isMobile ? 1.25 : 1.5;
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, targetDpr));
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x000000, 0);
		container.appendChild(renderer.domElement);

		// Shared geometry once
		sharedGeometry = new THREE.SphereGeometry(1, 12, 10);

		// Scaffold
		icosahedronVertices = createIcosahedronVertices();
		isDarkMode = !document.body.classList.contains('light-mode');

		const numSpheres = isMobile ? 120 : 200;
		for (let i = 0; i < numSpheres; i++) {
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

		// Animate
		animate();

		// Events
		window.addEventListener('resize', handleResize);
		const onVisibilityChange = () => {
			isVisible = document.visibilityState === 'visible';
			if (isVisible && !prefersReducedMotion) {
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
			motionQuery.removeEventListener('change', handleMotionChange);
			themeObserver?.disconnect();
			spheres.forEach((s) => (s.material as THREE.Material).dispose());
			if (sharedGeometry) sharedGeometry.dispose();
			if (container && renderer?.domElement?.parentNode === container) {
				container.removeChild(renderer.domElement);
			}
			renderer?.dispose();
		};
	});
</script>

<div class="dithered-grid-bg"></div>
{#if !prefersReducedMotion}
	<div bind:this={container} class="spheres-container"></div>
{/if}

<style>
	.dithered-grid-bg {
		position: fixed;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		z-index: -2;
		pointer-events: none;
		background-color: var(--bg);

		--grid-minor: rgba(255, 255, 255, 0.06);
		--grid-major: rgba(255, 255, 255, 0.12);

		background-image:
			linear-gradient(to right, var(--grid-minor) 1px, transparent 1px),
			linear-gradient(to bottom, var(--grid-minor) 1px, transparent 1px),
			linear-gradient(to right, var(--grid-major) 1px, transparent 1px),
			linear-gradient(to bottom, var(--grid-major) 1px, transparent 1px);
		
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

	:global(.light-mode) .dithered-grid-bg {
		--grid-minor: rgba(0, 0, 0, 0.08);
		--grid-major: rgba(0, 0, 0, 0.16);
	}

	.spheres-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: -1;
	}

	:global(canvas) {
		display: block !important;
		background: transparent !important;
	}
</style>
