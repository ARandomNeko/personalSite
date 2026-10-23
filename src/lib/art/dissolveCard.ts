import { tick } from 'svelte';
import { NoiseDissolve, type DissolveClock } from './NoiseDissolve';
import { snapshotCard } from './cardSnapshot';
import { unionRect, textureBounds, type CardRect } from './CardGeometry';

type Change = { key: string; clock?: DissolveClock; geometryOnly?: boolean };
type Snapshot = { image: HTMLCanvasElement; rect: CardRect };

// Keep the original HTML frame visible throughout the transition.
// Only the contents pass through the transparent shader surface.
export function dissolveCard(card: HTMLElement, initial: Change) {
	const content = card.querySelector<HTMLElement>('.side-card-content')!;
	const canvas = document.createElement('canvas');
	canvas.className = initial.geometryOnly ? 'identity-dissolve' : 'caption-dissolve';
	canvas.setAttribute('aria-hidden', 'true');
	canvas.dataset.active = 'false';
	canvas.style.cssText = 'position:fixed;pointer-events:none;visibility:hidden;z-index:2';
	card.parentElement!.append(canvas);
	const media = matchMedia('(prefers-reduced-motion: reduce)');
	let surface: CardRect = card.getBoundingClientRect();
	let renderer: NoiseDissolve | undefined;
	let previous: Snapshot | undefined;
	let change = initial;
	let revision = 0;
	let disposed = false;
	let resizeFrame = 0;
	let width = surface.width;

	function position(rect: CardRect) {
		surface = rect;
		Object.assign(canvas.style, {
			left: `${rect.left}px`,
			top: `${rect.top}px`,
			width: `${rect.width}px`,
			height: `${rect.height}px`
		});
	}
	function reveal() {
		renderer?.cancel();
		content.style.opacity = '';
	}
	async function capture(): Promise<Snapshot> {
		let rect: CardRect = card.getBoundingClientRect();
		const image = await snapshotCard(card, (bounds) => {
			rect = bounds;
		});
		return { image, rect };
	}
	async function warm() {
		const current = ++revision;
		try {
			const snapshot = await capture();
			if (!disposed && current === revision) {
				previous = snapshot;
				card.dataset.dissolveReady = 'true';
			}
		} catch {
			if (!disposed && current === revision) previous = undefined;
		}
	}
	let warmup = 0;
	if (!media.matches && document.fonts) {
		void document.fonts.ready.then(() => {
			if (disposed) return;
			if ('requestIdleCallback' in window) {
				warmup = window.requestIdleCallback(() => void warm(), { timeout: 1500 });
			} else void warm();
		});
	}

	async function update(next: Change) {
		if (next.key === change.key) return;
		change = next;
		const current = ++revision;
		if (
			media.matches ||
			!next.clock ||
			!previous ||
			performance.now() >= next.clock.started + next.clock.timing.duration
		) {
			reveal();
			await tick();
			if (!disposed && !media.matches && current === revision) void warm();
			return;
		}
		try {
			renderer ??= new NoiseDissolve(canvas, () => surface, true);
			// Preserve the current text pixels through rapid reversals without a CPU readback.
			const frozenRect = surface;
			const frozen = renderer.freeze();
			if (!frozen) {
				position(previous.rect);
				if (!renderer.hold(previous.image)) throw new Error('Card GPU unavailable');
			}
			content.style.opacity = '0';
			await tick();
			// Let the shared height measurement and Svelte resize updates settle
			// before capturing the target content inside the visible HTML frame.
			await new Promise<void>((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
			);
			if (disposed || current !== revision) return;
			const snapshot = await capture();
			if (disposed || current !== revision) return;
			const oldRect = frozen ? frozenRect : previous.rect;
			const area = unionRect(oldRect, snapshot.rect);
			const oldFrame = frozen ?? renderer.prepare(previous.image);
			const nextFrame = renderer.prepare(snapshot.image);
			position(area);
			previous = snapshot;
			canvas.dataset.fromHeight = String(oldRect.height);
			canvas.dataset.toHeight = String(snapshot.rect.height);
			if (
				!renderer.play(
					{ ...oldFrame, bounds: textureBounds(oldRect, area) },
					{ ...nextFrame, bounds: textureBounds(snapshot.rect, area) },
					() => {
						if (current === revision) reveal();
					},
					next.clock
				)
			)
				reveal();
		} catch {
			if (!disposed && current === revision) {
				reveal();
				canvas.dataset.renderer = 'fallback';
				void warm();
			}
		}
	}

	function cancel() {
		++revision;
		reveal();
		if (!disposed && !media.matches) void warm();
	}
	function motionChanged() {
		if (media.matches) cancel();
		else void warm();
	}
	const observer =
		typeof ResizeObserver === 'undefined'
			? null
			: new ResizeObserver(() => {
					const nextWidth = card.getBoundingClientRect().width;
					if (Math.abs(nextWidth - width) < 0.5) return;
					width = nextWidth;
					cancelAnimationFrame(resizeFrame);
					resizeFrame = requestAnimationFrame(cancel);
				});
	observer?.observe(card);
	card.addEventListener('focusin', cancel);
	media.addEventListener('change', motionChanged);
	return {
		update,
		destroy() {
			disposed = true;
			++revision;
			cancelAnimationFrame(resizeFrame);
			if (warmup) window.cancelIdleCallback(warmup);
			observer?.disconnect();
			media.removeEventListener('change', motionChanged);
			card.removeEventListener('focusin', cancel);
			renderer?.destroy();
			canvas.remove();
		}
	};
}
