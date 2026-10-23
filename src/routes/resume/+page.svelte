<script lang="ts">
	import LibraryBackdrop from '$lib/art/LibraryBackdrop.svelte';
	import { resolvePaintings } from '$lib/art/collection';
	import { activities, education, experience, projects, skills, summary } from '$lib/resume';

	const landscape = resolvePaintings(['nga-71503'])[0];
</script>

<svelte:head><title>Résumé | Rituparan Reddy Gurrala</title></svelte:head>

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

<LibraryBackdrop painting={landscape} />
<div class="resume-view">
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
	<aside class="art-credit" aria-label="Background painting">
		<a href={landscape.source} target="_blank" rel="noreferrer">{landscape.name} ↗</a><span
			>{landscape.artist}, {landscape.year}</span
		>
	</aside>
</div>

<style>
	.resume-view {
		padding: 80px max(6vw, 24px) 100px;
		font: 19px/1.65 var(--font-body);
	}
	.resume-sheet {
		max-width: 650px;
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
		margin: 26px 0;
	}
	h1 {
		font-size: clamp(64px, 7vw, 96px);
		letter-spacing: -0.025em;
		margin: 0;
	}
	h1 span {
		color: var(--cy);
	}
	.download {
		display: inline-block;
		margin-top: 24px;
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
		font-size: 23px;
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
		margin-top: 65px;
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
		position: fixed;
		right: 32px;
		bottom: 24px;
		text-align: right;
		text-shadow: 0 1px 5px #000;
		display: flex;
		flex-direction: column;
		gap: 4px;
		font: 9px/1.7 var(--font-mono);
		color: #d0cbbd;
		margin: 30px auto 0;
		max-width: 320px;
	}
	.art-credit a {
		text-decoration: none;
	}
	.art-credit span {
		opacity: 0.7;
	}

	@media (max-width: 900px) {
		.art-credit {
			position: static;
			text-align: left;
			margin: 60px 0 0;
		}
	}
	@media (max-width: 600px) {
		.resume-view {
			padding: 42px 28px 60px;
			font-size: 18px;
		}
		.name-row {
			margin: 24px 0;
		}
		h1 {
			font-size: 66px;
		}
		.summary {
			font-size: 21px;
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
	}
	@media print {
		.art-credit,
		.download {
			display: none;
		}
		.resume-view {
			padding: 20px;
			color: #111;
			background: white;
			--tx-2: #555;
			--cy: #444;
		}
		.resume-sheet {
			max-width: none;
		}
	}
</style>
