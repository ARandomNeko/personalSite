import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	test('should render h1', () => {
		render(Page, {
			data: {
				paintingSeed: 1,
				recentPosts: [
					{
						slug: 'rl-ppo-drone-sandbox',
						metadata: { title: 'RL/PPO Drone Simulation Sandbox', date: '2026-09-16' }
					}
				]
			}
		});
		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
	});
});
