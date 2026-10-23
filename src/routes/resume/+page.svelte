<script lang="ts">
	import { page } from '$app/stores';
	import LibraryBackdrop from '$lib/art/LibraryBackdrop.svelte';
	import PaintedBackdrop from '$lib/art/PaintedBackdrop.svelte';
	import { resolvePaintings } from '$lib/art/collection';
	import { activities, education, experience, projects, skills, summary } from '$lib/resume';

	const layouts = [
		{ id: 'document', name: 'The document' },
		{ id: 'margin', name: 'In the margins' },
		{ id: 'painting', name: 'An open canvas' },
		{ id: 'chapters', name: 'Three chapters' }
	];
	let view = $derived(
		layouts.find((layout) => layout.id === $page.url.searchParams.get('view'))?.id ?? 'document'
	);
	const collection = resolvePaintings(['nga-46523', 'nga-166436', 'schinkel-cathedral']);
	const landscape = resolvePaintings(['nga-71503'])[0];
	let scene = $state(0);
	let currentArt = $derived(
		view === 'painting' ? landscape : view === 'chapters' ? collection[scene] : collection[0]
	);
</script>

<svelte:head><title>Résumé | Rituparan Reddy Gurrala</title></svelte:head>

<nav class="layout-picker" aria-label="Résumé layouts">
	<span class="picker-label">Résumé studies</span>
	{#each layouts as layout, i (layout.id)}
		<a href="/resume?view={layout.id}" aria-current={view === layout.id ? 'page' : undefined}>
			<span class="number">0{i + 1}</span>
			{layout.name}
		</a>
	{/each}
</nav>

{#snippet identity()}
	<header class="identity">
		<div class="eyebrow">Curriculum vitæ <span> / </span> Developer · Builder · Problem solver</div>
		<div class="name-row">
			<h1>Rituparan Reddy<br /><span>Gurrala.</span></h1>
			<a href="/resume.pdf" download class="download"
				>Download PDF <span aria-hidden="true">↗</span></a
			>
		</div>
		<p class="summary">{summary}</p>
		<address>
			<a href="mailto:rituparanreddy2006@gmail.com">rituparanreddy2006@gmail.com</a>
			<a href="https://rituparan.com">rituparan.com ↗</a>
			<a href="tel:+19082086544">+1 908 208 6544</a>
			<a href="tel:+918978244211">+91 8978244211</a>
		</address>
	</header>
{/snippet}

{#snippet experienceContent()}
	<div class="entries">
		{#each experience as job (job.org)}
			<article class="entry">
				<p class="date">{job.date}</p>
				<div class="entry-body">
					<h3>{job.title}</h3>
					<p class="organization">{job.org}</p>
					<ul>
						{#each job.points as point (point)}<li>{point}</li>{/each}
					</ul>
				</div>
			</article>
		{/each}
	</div>
{/snippet}

{#snippet projectContent()}
	<div class="project-entries">
		{#each projects as project, i (project.href)}
			<article class="project-entry">
				<span class="project-number">0{i + 1}</span>
				<div>
					<h3><a href={project.href}>{project.title} <span aria-hidden="true">↗</span></a></h3>
					<p>{project.description}</p>
				</div>
			</article>
		{/each}
	</div>
	<a class="all-projects" href="/projects">All projects ↗</a>
{/snippet}

{#snippet educationContent()}
	<div class="entries">
		{#each education as school (school.org)}
			<article class="entry">
				<p class="date">{school.date}</p>
				<div class="entry-body">
					<h3>{school.title}</h3>
					<p class="organization">{school.org}</p>
				</div>
			</article>
		{/each}
	</div>
	<div class="supplement">
		<section>
			<h3 class="minor-heading">Tools & technologies</h3>
			<dl>
				{#each skills as skill (skill.label)}<div>
						<dt>{skill.label}</dt>
						<dd>{skill.text}</dd>
					</div>{/each}
			</dl>
		</section>
		<section>
			<h3 class="minor-heading">Scores</h3>
			<dl>
				<div>
					<dt>SAT · 1470</dt>
					<dd>Math: 770 · EBRW: 700</dd>
				</div>
				<div>
					<dt>IELTS · 8.0</dt>
					<dd>L: 9.0 · R: 8.5 · W: 8.0 · S: 7.5</dd>
				</div>
			</dl>
		</section>
	</div>
	<section class="activities">
		<h3 class="minor-heading">Volunteer & activities</h3>
		{#each activities as activity (activity.title)}
			<article class="entry">
				<p class="date">{activity.date}</p>
				<div class="entry-body">
					<h4>{activity.title}</h4>
					<p>{activity.description}</p>
				</div>
			</article>
		{/each}
	</section>
{/snippet}

{#key view}
	<div class="resume-view {view}" data-resume-layout={view}>
		{#if view === 'chapters'}
			<PaintedBackdrop {collection} onchange={(_, index) => (scene = index)} />
			<nav class="chapter-nav" aria-label="Résumé sections">
				{#each ['Experience', 'Projects', 'Education'] as label, i (label)}
					<a
						href="/resume?view=chapters#chapter-{i}"
						aria-current={scene === i ? 'location' : undefined}><span>0{i + 1}</span> {label}</a
					>
				{/each}
			</nav>
			<section class="chapter" data-scene="0" id="chapter-0">
				<div class="sheet">
					{@render identity()}
					<div class="section-heading">
						<span>01</span>
						<h2>Experience</h2>
					</div>
					{@render experienceContent()}
				</div>
			</section>
			<section class="chapter" data-scene="1" id="chapter-1">
				<div class="sheet">
					<div class="section-heading">
						<span>02</span>
						<h2>Selected projects</h2>
					</div>
					{@render projectContent()}
				</div>
			</section>
			<section class="chapter" data-scene="2" id="chapter-2">
				<div class="sheet">
					<div class="section-heading">
						<span>03</span>
						<h2>Education & beyond</h2>
					</div>
					{@render educationContent()}
				</div>
			</section>
		{:else}
			<LibraryBackdrop painting={view === 'painting' ? landscape : collection[0]} />
			<article class="resume-sheet">
				{@render identity()}
				<section class="resume-section">
					<div class="section-heading">
						<span>01</span>
						<h2>Experience</h2>
					</div>
					{@render experienceContent()}
				</section>
				<section class="resume-section">
					<div class="section-heading">
						<span>02</span>
						<h2>Selected projects</h2>
					</div>
					{@render projectContent()}
				</section>
				<section class="resume-section">
					<div class="section-heading">
						<span>03</span>
						<h2>Education & beyond</h2>
					</div>
					{@render educationContent()}
				</section>
			</article>
		{/if}
		<aside class="art-credit" aria-label="Background painting">
			<a href={currentArt.source} target="_blank" rel="noreferrer">{currentArt.name} ↗</a><span
				>{currentArt.artist}, {currentArt.year}</span
			>
		</aside>
	</div>
{/key}

<style>
	.layout-picker {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 8px 24px;
		padding: 18px 24px;
		background: #1b1e1df5;
		border-bottom: 1px solid #77786d55;
		font: 10px/1.5 var(--font-mono);
	}
	.picker-label {
		color: var(--tx-2);
		margin-right: 20px;
	}
	.layout-picker a {
		text-decoration: none;
		padding: 7px 0;
		color: var(--tx-2);
		border-bottom: 1px solid transparent;
	}
	.layout-picker a[aria-current] {
		color: var(--cy);
		border-color: var(--cy);
	}
	.number {
		opacity: 0.55;
		margin-right: 6px;
	}
	.resume-view {
		padding: 56px 40px 100px;
		font: 19px/1.65 var(--font-body);
	}
	.resume-sheet {
		max-width: 850px;
		margin: auto;
		padding: 58px 68px;
		background: #202225;
		border: 1px solid #77786d;
		box-shadow: 7px 7px #10171566;
	}
	.eyebrow {
		font: 9px/1.8 var(--font-mono);
		letter-spacing: 0.04em;
		color: var(--tx-2);
	}
	.eyebrow span {
		margin: 0 10px;
	}
	.name-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 20px;
		margin: 26px 0;
	}
	h1 {
		font-size: clamp(48px, 5vw, 68px);
		letter-spacing: -0.025em;
		margin: 0;
	}
	h1 span {
		color: var(--cy);
	}
	.download {
		font: 10px/1.8 var(--font-mono);
		white-space: nowrap;
		text-decoration: none;
		border-bottom: 1px solid #77786d;
		padding: 8px 0;
	}
	.download span {
		margin-left: 12px;
	}
	.summary {
		max-width: 58ch;
		font-size: 20px;
		line-height: 1.55;
	}
	address {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 24px;
		font: 10px/1.8 var(--font-mono);
		font-style: normal;
		color: var(--tx-2);
		margin-top: 26px;
		overflow-wrap: anywhere;
	}
	address a {
		text-decoration: none;
	}
	.identity {
		padding-bottom: 38px;
		border-bottom: 1px solid #77786d88;
	}
	.resume-section {
		margin-top: 40px;
	}
	.section-heading {
		display: flex;
		align-items: baseline;
		gap: 14px;
		margin-bottom: 28px;
	}
	.section-heading > span {
		color: var(--cy);
		font: 10px/1.5 var(--font-mono);
	}
	h2 {
		font-size: 36px;
		margin: 0;
	}
	h3 {
		font-size: 27px;
		margin: 0 0 5px;
	}
	h4 {
		font-size: 24px;
		margin: 0 0 6px;
	}
	.entry {
		margin-bottom: 30px;
	}
	.date {
		font: 10px/1.7 var(--font-mono);
		color: var(--cy);
		margin: 0 0 9px;
	}
	.organization {
		font-size: 16px;
		color: var(--tx-2);
		margin: 0 0 12px;
	}
	ul {
		padding-left: 18px;
		list-style: disc;
		margin: 0;
	}
	li {
		padding-left: 3px;
		margin-top: 8px;
	}
	li::marker {
		color: #8b8c7d;
		font-size: 10px;
	}
	.project-entry {
		display: flex;
		gap: 20px;
		border-top: 1px solid #77786d55;
		padding: 22px 0 10px;
	}
	.project-entry:first-child {
		border-top: 0;
		padding-top: 0;
	}
	.project-entry h3 a {
		text-decoration: none;
	}
	.project-entry h3 span {
		font-size: 18px;
		color: var(--cy);
	}
	.project-number {
		color: var(--tx-2);
		font: 10px/1.7 var(--font-mono);
		padding-top: 6px;
	}
	.project-entry p {
		margin: 10px 0 16px;
	}
	.all-projects {
		font: 10px/1.8 var(--font-mono);
		color: var(--cy);
	}
	.supplement {
		display: grid;
		grid-template-columns: 1.3fr 1fr;
		gap: 32px;
		padding: 28px 0;
		border-top: 1px solid #77786d55;
	}
	.minor-heading {
		font: 11px/1.8 var(--font-mono);
		color: var(--cy);
		margin: 0 0 20px;
	}
	dl,
	dd {
		margin: 0;
	}
	dl > div {
		margin-bottom: 14px;
	}
	dt {
		font-size: 16px;
		color: var(--tx-2);
	}
	dd {
		font-size: 18px;
	}
	.activities {
		border-top: 1px solid #77786d55;
		padding-top: 28px;
	}
	.activities p:not(.date) {
		font-size: 18px;
		margin-bottom: 0;
	}
	.art-credit {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font: 9px/1.7 var(--font-mono);
		color: #d0cbbd;
		margin: 30px auto 0;
		max-width: 850px;
	}
	.art-credit a {
		text-decoration: none;
	}
	.art-credit span {
		opacity: 0.7;
	}

	/* An editorial column with the chronology pulled into its own margin. */
	.margin .resume-sheet {
		max-width: 1080px;
		padding: 64px 72px;
		background: #202225f5;
	}
	.margin .identity {
		padding-left: 190px;
	}
	.margin h1 {
		font-size: 76px;
	}
	.margin .name-row {
		align-items: flex-end;
	}
	.margin .name-row .download {
		margin-bottom: 8px;
	}
	.margin .resume-section {
		position: relative;
		padding-left: 190px;
		padding-top: 30px;
		border-top: 1px solid #77786d88;
	}
	.margin .section-heading {
		position: absolute;
		top: 30px;
		left: 0;
		flex-direction: column;
		gap: 8px;
	}
	.margin .section-heading h2 {
		font-size: 25px;
		max-width: 130px;
	}
	.margin .entry {
		position: relative;
	}
	.margin .entry > .date {
		position: absolute;
		right: calc(100% + 30px);
		width: 160px;
		text-align: right;
		padding-top: 4px;
	}
	.margin .resume-section:first-of-type {
		margin-top: 0;
		border: 0;
	}
	.margin .resume-section:first-of-type .section-heading {
		position: static;
		flex-direction: row;
		margin-bottom: 32px;
	}
	.margin .resume-section:first-of-type .section-heading h2 {
		max-width: none;
		font-size: 36px;
	}
	.margin .art-credit {
		max-width: 1080px;
	}

	/* No sheet: the text inhabits the landscape. */
	.painting {
		padding: 80px max(6vw, 24px) 100px;
	}
	.painting .resume-sheet {
		max-width: 650px;
		padding: 0;
		margin: 0;
		border: 0;
		background: transparent;
		box-shadow: none;
	}
	.painting h1 {
		font-size: clamp(64px, 7vw, 96px);
	}
	.painting .name-row {
		display: block;
	}
	.painting .download {
		display: inline-block;
		margin-top: 24px;
	}
	.painting .summary {
		font-size: 23px;
	}
	.painting .resume-section {
		margin-top: 65px;
	}
	.painting .art-credit {
		position: fixed;
		right: 32px;
		bottom: 24px;
		text-align: right;
		max-width: 320px;
		text-shadow: 0 1px 5px #000;
	}

	/* Independent scroll chapters, each opening onto a different work. */
	.chapters {
		padding: 0 5vw 10vh;
	}
	.chapter {
		min-height: 100dvh;
		padding: 10vh 0;
		display: flex;
		align-items: center;
		scroll-margin-top: var(--site-header-height);
	}
	.chapter .sheet {
		width: min(760px, 100%);
		padding: 48px 52px;
		background: #202225f5;
		border: 1px solid #77786d;
		box-shadow: 7px 7px #10171566;
	}
	.chapter:nth-of-type(2) {
		justify-content: flex-end;
	}
	.chapter .identity {
		margin-bottom: 36px;
	}
	.chapter-nav {
		position: fixed;
		right: 30px;
		top: calc(var(--site-header-height) + 100px);
		display: flex;
		flex-direction: column;
		gap: 15px;
		font: 10px/1.6 var(--font-mono);
		z-index: 2;
		padding: 18px;
		background: #1b1e1de8;
		border: 1px solid #77786d88;
	}
	.chapter-nav a {
		text-decoration: none;
		color: var(--tx-2);
	}
	.chapter-nav a[aria-current] {
		color: var(--cy);
	}
	.chapter-nav span {
		margin-right: 10px;
	}
	.chapters .art-credit {
		max-width: none;
		background: #202225e8;
		display: inline-flex;
		padding: 12px 18px;
	}
	@media (min-width: 1100px) {
		.chapters .chapter:nth-of-type(2) {
			padding-right: 190px;
		}
	}
	@media (max-width: 900px) {
		.margin .resume-sheet {
			padding: 40px;
		}
		.margin .identity {
			padding-left: 0;
		}
		.margin h1 {
			font-size: 64px;
		}
		.margin .resume-section {
			padding-left: 150px;
		}
		.margin .entry > .date {
			width: 125px;
			right: calc(100% + 25px);
		}
		.chapter-nav {
			position: sticky;
			top: var(--site-header-height);
			margin: 0 -5vw;
			flex-direction: row;
			justify-content: center;
			border-width: 0 0 1px;
		}
		.chapter:nth-of-type(2) {
			justify-content: flex-start;
		}
		.chapter {
			padding: 50px 0;
		}
		.painting .art-credit {
			position: static;
			text-align: left;
			margin: 60px 0 0;
		}
	}
	@media (max-width: 600px) {
		.layout-picker {
			gap: 4px 18px;
			justify-content: flex-start;
			padding: 12px 24px;
		}
		.picker-label {
			width: 100%;
			margin: 0 0 2px;
			font-size: 9px;
		}
		.layout-picker a {
			width: calc(50% - 9px);
		}
		.resume-view {
			padding: 28px 16px 48px;
			font-size: 18px;
		}
		.resume-sheet,
		.margin .resume-sheet {
			padding: 30px 24px;
		}
		.name-row {
			display: block;
			margin: 24px 0;
		}
		.download {
			display: inline-block;
			margin-top: 20px;
		}
		h1,
		.margin h1 {
			font-size: 54px;
		}
		.summary {
			font-size: 19px;
		}
		.eyebrow span {
			margin: 0 4px;
		}
		address {
			gap: 8px 16px;
		}
		h2 {
			font-size: 32px;
		}
		h3 {
			font-size: 26px;
		}
		.supplement {
			grid-template-columns: 1fr;
			gap: 16px;
		}
		.margin .resume-section {
			padding-left: 0;
		}
		.margin .section-heading {
			position: static;
			flex-direction: row;
		}
		.margin .section-heading h2 {
			max-width: none;
			font-size: 32px;
		}
		.margin .entry > .date {
			position: static;
			width: auto;
			text-align: left;
			padding: 0;
		}
		.painting {
			padding: 42px 28px 60px;
		}
		.painting h1 {
			font-size: 66px;
		}
		.painting .summary {
			font-size: 21px;
		}
		.chapters {
			padding: 0 16px 40px;
		}
		.chapter-nav {
			margin: 0 -16px;
			gap: 14px;
			padding: 14px 8px;
			font-size: 9px;
		}
		.chapter-nav span {
			margin-right: 4px;
		}
		.chapter .sheet {
			padding: 32px 24px;
		}
	}
	@media print {
		.layout-picker,
		.chapter-nav,
		.art-credit,
		.download {
			display: none;
		}
		.resume-view {
			padding: 0;
			color: #111;
			--tx-2: #555;
			--cy: #444;
		}
		.resume-sheet,
		.margin .resume-sheet,
		.chapter .sheet {
			background: white;
			border: 0;
			box-shadow: none;
			padding: 20px;
			max-width: none;
		}
		.chapter {
			min-height: 0;
			padding: 0;
		}
	}
</style>
