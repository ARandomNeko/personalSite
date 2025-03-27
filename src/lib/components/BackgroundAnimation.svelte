<!-- src/lib/components/BackgroundAnimation.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';

	let container: HTMLCanvasElement;
	let renderer: THREE.WebGLRenderer;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let animationFrameId: number;
	let particles: THREE.Points;

	onMount(() => {
		if (!container) return;

		// Scene
		scene = new THREE.Scene();

		// Camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 5;

		// Renderer
		renderer = new THREE.WebGLRenderer({ canvas: container, alpha: true }); // alpha: true for transparent background
		renderer.setClearColor(0x000000, 0); // Set clear color to transparent
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// Particles
		const particleCount = 5000;
		const geometry = new THREE.BufferGeometry();
		const positions = new Float32Array(particleCount * 3);

		for (let i = 0; i < particleCount * 3; i++) {
			positions[i] = (Math.random() - 0.5) * 10; // Spread particles within a cube
		}
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

		const material = new THREE.PointsMaterial({
			size: 0.005, // Make particles very small
			color: 0x888888, // Use a color from your theme or a neutral gray
			transparent: true,
			opacity: 0.6
		});

		particles = new THREE.Points(geometry, material);
		scene.add(particles);

		// Animation loop
		const animate = () => {
			animationFrameId = requestAnimationFrame(animate);

			// Simple rotation animation
			const time = Date.now() * 0.0001;
			particles.rotation.x = time * 0.25;
			particles.rotation.y = time * 0.5;

			renderer.render(scene, camera);
		};
		animate();

		// Handle window resize
		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		};
		window.addEventListener('resize', handleResize);

		// Cleanup on component destroy
		return () => {
			cancelAnimationFrame(animationFrameId);
			window.removeEventListener('resize', handleResize);
			// Dispose Three.js objects
			geometry.dispose();
			material.dispose();
			renderer.dispose();
			scene.remove(particles);
			// Optional: If you add more objects, dispose them here
		};
	});
</script>

<canvas bind:this={container} class="fixed top-0 left-0 -z-10"></canvas>

<style>
	canvas {
		display: block; /* Prevent extra space below canvas */
		outline: none;
	}
</style>
