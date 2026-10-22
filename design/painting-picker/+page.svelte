<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import ArtDetail from '$lib/art/ArtDetail.svelte';
	import {
		paintings,
		defaultIds,
		draftKey,
		selectionKey,
		readIds,
		resolvePaintings,
		imageSrc,
		imageSet,
		type Painting
	} from '$lib/art/collection';
	let selected = $state<string[]>([...defaultIds]);
	let query = $state('');
	let category = $state('All subjects');
	let selectedOnly = $state(false);
	let sequenceOpen = $state(false);
	let preview = $state<Painting | null>(null);
	let dialog: HTMLDialogElement;
	let notice = $state('');
	let inspectDetail = $state(false);
	const categories = ['All subjects', ...new Set(paintings.map((p) => p.category))];
	const filtered = $derived(
		paintings.filter(
			(p) =>
				(!selectedOnly || selected.includes(p.id)) &&
				(category === 'All subjects' || p.category === category) &&
				`${p.name} ${p.artist} ${p.year} ${p.style}`
					.toLowerCase()
					.includes(query.toLowerCase().trim())
		)
	);
	const sequence = $derived(resolvePaintings(selected));
	onMount(() => {
		if (new URL(window.location.href).searchParams.get('subject') === 'knights') {
			category = 'Knights & legends';
		}
		try {
			selected = readIds(localStorage, localStorage.getItem(draftKey) ? draftKey : selectionKey);
		} catch {
			notice = 'Browser storage is unavailable. You can still export your selection.';
		}
	});
	function saveDraft() {
		try {
			localStorage.setItem(draftKey, JSON.stringify(selected));
			notice = '';
		} catch {
			notice = 'Could not save in this browser. Export your selection to keep it.';
		}
	}
	function toggle(id: string) {
		selected = selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id];
		saveDraft();
	}
	function move(id: string, offset: number) {
		const i = selected.indexOf(id),
			j = i + offset;
		if (j < 0 || j >= selected.length) return;
		const next = [...selected];
		[next[i], next[j]] = [next[j], next[i]];
		selected = next;
		saveDraft();
	}
	async function openPreview(p: Painting) {
		preview = p;
		inspectDetail = false;
		await tick();
		dialog.showModal();
	}
	function previewNext(offset: number) {
		if (!preview || !filtered.length) return;
		const i = filtered.findIndex((p) => p.id === preview?.id);
		preview = filtered[(i + offset + filtered.length) % filtered.length];
	}
	async function apply() {
		if (!selected.length) return;
		try {
			localStorage.setItem(selectionKey, JSON.stringify(selected));
			document.cookie = `${selectionKey}=${encodeURIComponent(JSON.stringify(selected))}; Path=/; Max-Age=31536000; SameSite=Lax`;
			await goto('/');
		} catch {
			notice = 'Could not apply in this browser. Export your selection to keep it.';
		}
	}
	function exportSelection() {
		const data = JSON.stringify(
			{
				version: 1,
				ids: selected,
				paintings: sequence.map(({ id, name, artist, year, source }) => ({
					id,
					name,
					artist,
					year,
					source
				}))
			},
			null,
			2
		);
		const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = 'ritu-painting-selection.json';
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}
</script>

<svelte:head>
	<title>Choose the paintings — Rituparan Reddy</title>
	<meta
		name="description"
		content="Choose paintings, inspect the details, and build a sequence for the journal."
	/>
</svelte:head>

<div class="art-picker">
	<header class="picker-header">
		<a href="/">← Back to the journal</a><span>Rituparan Reddy</span><a href="/moodboard"
			>Moodboard</a
		>
	</header>
	<main>
		<div class="intro">
			<div>
				<h1>Choose the paintings.</h1>
				<p>{paintings.length} works. Open one to look closer. Pick what belongs here.</p>
			</div>
			<button
				class="sequence-button"
				onclick={() => (sequenceOpen = !sequenceOpen)}
				aria-expanded={sequenceOpen}>Your sequence <span>{selected.length}</span></button
			>
		</div>
		<div class="filters">
			<label class="search"
				><span class="sr-only">Search paintings</span><input
					type="search"
					bind:value={query}
					placeholder="Search title, painter, style…"
				/></label
			>
			<label
				><span class="sr-only">Subject</span><select bind:value={category}
					>{#each categories as item}<option>{item}</option>{/each}</select
				></label
			>
			<button
				class:active={category === 'Knights & legends'}
				aria-pressed={category === 'Knights & legends'}
				onclick={() => {
					category = category === 'Knights & legends' ? 'All subjects' : 'Knights & legends';
					query = '';
					selectedOnly = false;
				}}>Knights & legends</button
			>
			<button
				class:active={selectedOnly}
				aria-pressed={selectedOnly}
				onclick={() => (selectedOnly = !selectedOnly)}>Selected only</button
			>
			<span class="result-count" aria-live="polite">{filtered.length} paintings</span>
		</div>
		{#if notice}<p class="notice" role="status">{notice}</p>{/if}
		<div class="painting-grid">
			{#each filtered as painting (painting.id)}
				<article
					class="painting-option"
					class:chosen={selected.includes(painting.id)}
					data-artwork={painting.id}
				>
					<button
						class="preview-button"
						onclick={() => openPreview(painting)}
						aria-label={`Preview ${painting.name} by ${painting.artist}`}
					>
						<img
							src={painting.thumb}
							alt={painting.name}
							loading="lazy"
							decoding="async"
							width={painting.width}
							height={painting.height}
						/>
					</button>
					<div class="option-details">
						<div class="credit">
							<h2><button onclick={() => openPreview(painting)}>{painting.name}</button></h2>
							<p>{painting.artist}</p>
							<span>{painting.year} / {painting.style}</span>
						</div>
						<button
							class="select-button"
							class:selected={selected.includes(painting.id)}
							onclick={() => toggle(painting.id)}
							aria-pressed={selected.includes(painting.id)}
							aria-label={`${selected.includes(painting.id) ? 'Remove' : 'Select'} ${painting.name}`}
							>{selected.includes(painting.id) ? '✓ Selected' : '+ Select'}</button
						>
					</div>
				</article>
			{/each}
		</div>
		{#if !filtered.length}<p class="empty">
				No paintings match. Try another title, painter, or subject.
			</p>{/if}
		<p class="credits-note">
			Titles, dates, and artist credits come from the collection records. Style and subject
			groupings are editorial. Source links and original-resolution images are available in each
			preview.
		</p>
	</main>

	{#if sequenceOpen}
		<aside class="sequence-panel" aria-label="Your painting sequence">
			<div class="panel-heading">
				<h2>Your sequence</h2>
				<button onclick={() => (sequenceOpen = false)} aria-label="Close sequence">×</button>
			</div>
			<p>The site follows this order as you scroll.</p>
			<div class="sequence-tools">
				<button
					onclick={() => {
						selected = [];
						saveDraft();
					}}>Clear selection</button
				><button
					onclick={() => {
						selected = [...defaultIds];
						saveDraft();
					}}>Restore defaults</button
				>
			</div>
			<ol>
				{#each sequence as painting, i (painting.id)}
					<li>
						<img src={painting.thumb} alt="" /><span>{painting.name}</span>
						<div class="reorder">
							<button
								disabled={i === 0}
								onclick={() => move(painting.id, -1)}
								aria-label={`Move ${painting.name} earlier`}>↑</button
							><button
								disabled={i === sequence.length - 1}
								onclick={() => move(painting.id, 1)}
								aria-label={`Move ${painting.name} later`}>↓</button
							><button
								onclick={() => toggle(painting.id)}
								aria-label={`Remove ${painting.name} from sequence`}>×</button
							>
						</div>
					</li>
				{/each}
			</ol>
			{#if !sequence.length}<p>Select a painting to begin.</p>{/if}
		</aside>
	{/if}

	<footer class="selection-bar">
		<div>
			<strong>{selected.length} selected</strong><span
				>Saved in this browser. Export to keep a copy.</span
			>
		</div>
		<div class="selection-actions">
			<button onclick={exportSelection} disabled={!selected.length}>Export selection</button><button
				class="apply"
				onclick={apply}
				disabled={!selected.length}
				>Use {selected.length === 1 ? 'this painting' : `these ${selected.length} paintings`} ↗</button
			>
		</div>
	</footer>

	<dialog
		bind:this={dialog}
		onkeydown={(event) => {
			if (inspectDetail) return;
			if (event.key === 'ArrowRight') previewNext(1);
			if (event.key === 'ArrowLeft') previewNext(-1);
		}}
		aria-label={preview ? `Preview: ${preview.name}` : 'Painting preview'}
	>
		{#if preview}
			<div class="preview-toolbar">
				<button onclick={() => previewNext(-1)} aria-label="Previous painting">← Previous</button>
				<button onclick={() => previewNext(1)} aria-label="Next painting">Next →</button>
				<button onclick={() => (inspectDetail = !inspectDetail)}
					>{inspectDetail ? 'Whole painting' : 'Inspect detail'}</button
				>
				<button class="close-preview" onclick={() => dialog.close()} aria-label="Close preview"
					>Close ×</button
				>
			</div>
			<div class="preview-stage">
				{#if inspectDetail}
					{#key preview.id}<ArtDetail painting={preview} />{/key}
				{:else}
					<img
						src={imageSrc(preview, 3200)}
						srcset={imageSet(preview)}
						sizes="90vw"
						alt={preview.name}
					/>
				{/if}
			</div>
			<div class="preview-caption">
				<div>
					<h2>{preview.name}</h2>
					<p>{preview.artist}, {preview.year}</p>
					<p>{preview.style} / {preview.medium}</p>
					<div class="source-links">
						<a href={preview.source} target="_blank" rel="noreferrer">{preview.museum} ↗</a><a
							href={preview.original}
							target="_blank"
							rel="noreferrer">Original image ↗</a
						>
					</div>
					{#if preview.license && preview.licenseUrl}
						<p class="image-credit">
							{preview.imageCredit || preview.artist} ·
							<a href={preview.licenseUrl} target="_blank" rel="noreferrer">{preview.license}</a
							>{preview.imageCredit ? ' · Resized for display.' : ''}
						</p>
					{/if}
					<small
						>Original: {preview.sourceWidth?.toLocaleString()} × {preview.sourceHeight?.toLocaleString()}
						pixels</small
					>
				</div>
				<button
					class="select-button"
					class:selected={selected.includes(preview.id)}
					aria-pressed={selected.includes(preview.id)}
					onclick={() => preview && toggle(preview.id)}
					>{selected.includes(preview.id) ? '✓ Selected' : '+ Add to selection'}</button
				>
			</div>
		{/if}
	</dialog>
</div>

<style>
	:global(body:has(.art-picker)) {
		overflow: auto;
		background: #202225;
	}
	.art-picker {
		color: #dfd9c9;
		font:
			14px/1.6 Georgia,
			serif;
	}
	a {
		color: inherit;
		text-underline-offset: 4px;
	}
	button,
	input,
	select {
		font:
			11px/1.6 'JetBrains Mono',
			monospace;
	}
	button,
	select {
		cursor: pointer;
	}
	button {
		background: transparent;
		border: 1px solid #666c62;
		color: inherit;
		padding: 10px 14px;
	}
	button:hover {
		background: #343936;
	}
	button:disabled {
		cursor: default;
		opacity: 0.4;
	}
	:focus-visible {
		outline: 2px solid #d4c393;
		outline-offset: 4px;
	}
	.picker-header {
		height: 58px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 4%;
		border-bottom: 1px solid #666c62;
	}
	.picker-header a {
		font:
			10px 'JetBrains Mono',
			monospace;
		text-decoration: none;
	}
	.picker-header span {
		font:
			23px 'Instrument Serif',
			serif;
	}
	main {
		padding: 55px 4% 140px;
		max-width: 1920px;
		margin: auto;
	}
	.intro {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: 30px;
		margin-bottom: 38px;
	}
	h1 {
		font:
			68px/1.05 'Instrument Serif',
			serif;
		margin: 0 0 16px;
		letter-spacing: -0.025em;
	}
	.intro p {
		margin: 0;
		color: #b3b4a8;
		font-size: 16px;
	}
	.sequence-button {
		white-space: nowrap;
	}
	.sequence-button span {
		margin-left: 18px;
		color: #d4c393;
	}
	.filters {
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 32px;
	}
	.search {
		flex: 1;
		max-width: 460px;
		min-width: 220px;
	}
	input,
	select {
		width: 100%;
		background: #171c20;
		border: 1px solid #666c62;
		color: #dfd9c9;
		padding: 11px 15px;
		border-radius: 0;
	}
	input::placeholder {
		color: #a0a398;
	}
	.filters select {
		width: auto;
		padding-right: 38px;
	}
	.active {
		background: #dfd9c9;
		color: #202225;
	}
	.result-count {
		margin-left: auto;
		font:
			10px 'JetBrains Mono',
			monospace;
		color: #b3b4a8;
	}
	.painting-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 36px 22px;
	}
	.painting-option {
		min-width: 0;
		border-bottom: 1px solid #53594f;
		padding-bottom: 18px;
	}
	.preview-button {
		width: 100%;
		height: 270px;
		padding: 15px;
		background: #161b1e;
		border-color: transparent;
		display: block;
	}
	.preview-button img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.chosen .preview-button {
		border-color: #b8a67c;
	}
	.option-details {
		padding-top: 19px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 15px;
	}
	h2 {
		font:
			27px/1.08 'Instrument Serif',
			serif;
		margin: 0 0 10px;
	}
	h2 button {
		font: inherit;
		text-align: left;
		padding: 0;
		border: 0;
	}
	h2 button:hover {
		background: transparent;
		text-decoration: underline;
	}
	.credit p {
		font:
			11px/1.6 'JetBrains Mono',
			monospace;
		margin: 0 0 4px;
	}
	.credit span {
		font:
			10px/1.5 'JetBrains Mono',
			monospace;
		color: #aaa99d;
	}
	.select-button {
		padding: 7px 12px;
	}
	.select-button.selected {
		background: #b8a67c;
		color: #171c20;
		border-color: #b8a67c;
	}
	.empty {
		padding: 100px 0;
	}
	.credits-note {
		max-width: 760px;
		font:
			10px/1.9 'JetBrains Mono',
			monospace;
		color: #aaa99d;
		margin: 55px 0 0;
	}
	.selection-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 10;
		background: #303638;
		border-top: 1px solid #898a7e;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 20px;
		padding: 17px 4%;
		box-shadow: 0 -10px 30px #0003;
	}
	.selection-bar strong {
		font:
			14px 'JetBrains Mono',
			monospace;
		display: block;
	}
	.selection-bar span {
		font:
			10px 'JetBrains Mono',
			monospace;
		color: #b3b4a8;
		display: block;
		margin-top: 7px;
	}
	.selection-actions {
		display: flex;
		gap: 12px;
	}
	.apply {
		background: #dfd9c9;
		color: #202225;
		border-color: #dfd9c9;
	}
	.apply:hover {
		background: #c7bc9b;
	}
	.sequence-panel {
		position: fixed;
		z-index: 9;
		right: 20px;
		top: 78px;
		bottom: 110px;
		width: min(440px, calc(100% - 40px));
		background: #24292c;
		border: 1px solid #898a7e;
		padding: 22px;
		overflow-y: auto;
		box-shadow: 8px 8px #0007;
	}
	.panel-heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
	}
	.panel-heading h2 {
		margin: 0;
		font-size: 34px;
	}
	.panel-heading button {
		font-size: 20px;
		padding: 0 10px;
	}
	.sequence-panel > p {
		font:
			11px/1.7 'JetBrains Mono',
			monospace;
		color: #b3b4a8;
	}
	.sequence-panel ol {
		list-style: none;
		padding: 0;
	}
	.sequence-panel li {
		display: flex;
		gap: 12px;
		align-items: center;
		padding: 15px 0;
		border-bottom: 1px solid #555c54;
	}
	.sequence-panel li img {
		width: 50px;
		height: 60px;
		object-fit: contain;
	}
	.sequence-panel li > span {
		flex: 1;
		font:
			22px/1.1 'Instrument Serif',
			serif;
	}
	.reorder {
		display: flex;
		gap: 3px;
	}
	.reorder button {
		padding: 5px 7px;
	}
	dialog {
		color: #dfd9c9;
		background: #171c20;
		border: 1px solid #898a7e;
		width: min(1400px, 94vw);
		max-height: 94dvh;
		padding: 0;
		margin: auto;
	}
	dialog::backdrop {
		background: #0a1013e8;
	}
	.preview-toolbar {
		display: flex;
		gap: 10px;
		padding: 14px 20px;
		position: sticky;
		top: 0;
		background: #171c20;
		z-index: 1;
	}
	.close-preview {
		margin-left: auto;
	}
	.preview-stage {
		height: 65dvh;
		padding: 10px 25px;
		display: flex;
		justify-content: center;
	}
	.preview-stage img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.preview-caption {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 30px;
		padding: 25px 30px 30px;
	}
	.preview-caption h2 {
		font-size: 35px;
	}
	.preview-caption p {
		font:
			11px/1.7 'JetBrains Mono',
			monospace;
		margin: 6px 0;
		color: #b3b4a8;
	}
	.source-links {
		display: flex;
		gap: 20px;
		flex-wrap: wrap;
		font:
			10px/1.8 'JetBrains Mono',
			monospace;
		margin: 15px 0 10px;
	}
	.preview-caption small {
		font:
			10px 'JetBrains Mono',
			monospace;
		color: #aaa99d;
	}
	.preview-caption .select-button {
		flex-shrink: 0;
	}
	.notice {
		border: 1px solid #b8a67c;
		padding: 15px;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	@media (min-width: 1800px) {
		.preview-button {
			height: 340px;
		}
	}
	@media (max-width: 1050px) {
		.painting-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.preview-button {
			height: 230px;
		}
	}
	@media (max-width: 700px) {
		.picker-header {
			padding: 0 20px;
		}
		.picker-header span {
			display: none;
		}
		main {
			padding: 36px 20px 160px;
		}
		.intro {
			display: block;
		}
		h1 {
			font-size: 48px;
		}
		.intro p {
			font-size: 15px;
		}
		.sequence-button {
			margin-top: 23px;
		}
		.painting-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 30px 14px;
		}
		.preview-button {
			height: 190px;
			padding: 8px;
		}
		.option-details {
			padding-top: 14px;
		}
		h2 {
			font-size: 24px;
		}
		.credit p {
			font-size: 10px;
		}
		.credit span {
			font-size: 9px;
		}
		.filters {
			gap: 10px;
		}
		.search {
			max-width: none;
			flex-basis: 100%;
		}
		.filters select {
			max-width: 180px;
		}
		.filters button {
			padding: 10px;
		}
		.result-count {
			width: 100%;
			margin: 6px 0 0;
		}
		.selection-bar {
			padding: 14px 20px;
			flex-wrap: wrap;
			gap: 12px;
		}
		.selection-bar span {
			display: none;
		}
		.selection-bar strong {
			font-size: 11px;
		}
		.selection-actions {
			gap: 8px;
			width: 100%;
		}
		.selection-actions button {
			flex: 1;
			font-size: 10px;
			padding: 9px;
		}
		.sequence-panel {
			bottom: 130px;
			top: 70px;
			padding: 18px;
		}
		.preview-stage {
			height: 49dvh;
			padding: 5px 12px;
		}
		.preview-toolbar {
			gap: 6px;
			padding: 10px;
		}
		.preview-toolbar button {
			font-size: 10px;
			padding: 8px;
		}
		.preview-caption {
			display: block;
			padding: 20px;
		}
		.preview-caption h2 {
			font-size: 30px;
		}
		.preview-caption .select-button {
			margin-top: 20px;
		}
	}
	@media (max-width: 370px) {
		.painting-grid {
			grid-template-columns: 1fr;
		}
		.preview-button {
			height: 300px;
		}
	}

	.sequence-tools {
		display: flex;
		gap: 10px;
		margin: 16px 0;
	}
	.sequence-tools button {
		padding: 7px 10px;
		font-size: 10px;
	}
</style>
