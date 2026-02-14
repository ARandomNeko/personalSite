<svelte:head>
	<title>Resume | Rituparan Reddy</title>
</svelte:head>

<section class="resume-layout py-6">
	<div class="animate-fade-in">
		<h1 class="mb-3 text-3xl font-bold !text-[--re]">Resume</h1>
		<p class="mb-6 text-lg text-[--tx-2]">Developer // Builder // Problem Solver</p>
	</div>

	<div class="animate-fade-in animate-delay-1 mb-6">
		<p class="text-sm text-[--tx-2]">
			Highly motivated and skilled developer with experience in web technologies, passionate about
			creating efficient and elegant solutions. Eager to contribute to innovative projects.
		</p>
	</div>

	<div class="resume-grid">
		<!-- Experience -->
		<div class="resume-section animate-fade-in animate-delay-2">
			<h2 class="section-heading">// EXPERIENCE</h2>

			<div class="resume-card">
				<div class="card-header">
					<span class="card-title">Chief Technology Officer (CTO)</span>
					<span class="card-date">2022 - 2024</span>
				</div>
				<span class="card-org">World Peace Today</span>
				<ul class="card-list">
					<li>
						Led technology initiatives for a non-profit organization focused on community support.
					</li>
					<li>
						Developed and maintained organization's website (https://worldpeacetoday.vercel.app).
					</li>
					<li>Contributed to campaigns that provided over 3,500 meals to those in need.</li>
				</ul>
			</div>

			<div class="resume-card">
				<div class="card-header">
					<span class="card-title">Head of IT</span>
					<span class="card-date">2023</span>
				</div>
				<span class="card-org">Hack4Earth</span>
				<ul class="card-list">
					<li>
						Served as Head of IT for sustainability-themed hackathon based on UN SDGs and STEM
						education.
					</li>
					<li>Managed technical infrastructure for an event with over 550 participants.</li>
					<li>Oversaw distribution of $250,000 in prizes.</li>
				</ul>
			</div>

			<div class="resume-card">
				<div class="card-header">
					<span class="card-title">Wellness Secretary</span>
					<span class="card-date">2023 - 2024</span>
				</div>
				<span class="card-org">Sreenidhi International School Student Council</span>
				<ul class="card-list">
					<li>Serve as the fourth-highest position in the school's student council.</li>
					<li>Focus on student wellbeing and inclusivity initiatives.</li>
					<li>Organize and implement wellness programs.</li>
				</ul>
			</div>

			<div class="resume-card">
				<div class="card-header">
					<span class="card-title">Secretary</span>
					<span class="card-date">2022 - 2023</span>
				</div>
				<span class="card-org">Rotary Interact Club</span>
				<ul class="card-list">
					<li>Coordinated club activities and community service projects.</li>
					<li>Maintained records and facilitated communication between members.</li>
					<li>
						Implemented initiatives to improve community wellbeing both within and outside school.
					</li>
				</ul>
			</div>
		</div>

		<!-- Right Column -->
		<div class="resume-sidebar">
			<!-- Education -->
			<div class="resume-section animate-fade-in animate-delay-3">
				<h2 class="section-heading">// EDUCATION</h2>
				<div class="resume-card">
					<div class="card-header">
						<span class="card-title">IB Diploma Program</span>
						<span class="card-date">2017 - 2024</span>
					</div>
					<span class="card-org">Sreenidhi International School, Hyderabad</span>
					<ul class="card-list">
						<li>HL: Math AA, Physics, Chemistry</li>
						<li>SL: English, Spanish B, Economics</li>
						<li>Certificate of Academic Merit</li>
						<li>Runner-Up, Science Fair (2nd/75)</li>
					</ul>
				</div>
			</div>

			<!-- Skills -->
			<div class="resume-section animate-fade-in animate-delay-3">
				<h2 class="section-heading">// SKILLS</h2>
				<div class="resume-card">
					<div class="skills-group">
						<span class="text-xs text-[--tx-2]">Languages</span>
						<div class="mt-1 flex flex-wrap gap-2">
							<span class="tag">Haskell</span>
							<span class="tag">C++</span>
							<span class="tag">Nix</span>
						</div>
					</div>
					<div class="skills-group">
						<span class="text-xs text-[--tx-2]">Web</span>
						<div class="mt-1 flex flex-wrap gap-2">
							<span class="tag">Svelte</span>
							<span class="tag">SvelteKit</span>
						</div>
					</div>
					<div class="skills-group">
						<span class="text-xs text-[--tx-2]">Technologies</span>
						<div class="mt-1 flex flex-wrap gap-2">
							<span class="tag">Robotics</span>
							<span class="tag">IoT</span>
							<span class="tag">Computer Vision</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Test Scores -->
			<div class="resume-section animate-fade-in animate-delay-4">
				<h2 class="section-heading">// SCORES</h2>
				<div class="resume-card">
					<div class="score-row">
						<span class="card-title">SAT</span>
						<span class="text-sm">1470</span>
					</div>
					<div class="mb-3 text-xs text-[--tx-2]">Math: 770 | EBRW: 700</div>
					<div class="score-row">
						<span class="card-title">IELTS</span>
						<span class="text-sm">8.0</span>
					</div>
					<div class="text-xs text-[--tx-2]">L: 9.0 | R: 8.5 | W: 8.0 | S: 7.5</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Projects -->
	<div class="resume-section animate-fade-in animate-delay-4 mt-6">
		<h2 class="section-heading">// PROJECTS</h2>
		<div class="projects-grid">
			<div class="resume-card">
				<span class="card-title">Hexapod Robot</span>
				<p class="mt-1 text-xs text-[--tx-2]">
					6-legged robot with vision navigation for autonomous obstacle detection and avoidance.
				</p>
			</div>
			<div class="resume-card">
				<span class="card-title">Custom Computer</span>
				<p class="mt-1 text-xs text-[--tx-2]">Built a personal computer from components.</p>
			</div>
			<div class="resume-card">
				<span class="card-title">Ergonomic Keyboard</span>
				<p class="mt-1 text-xs text-[--tx-2]">
					Designed and assembled a custom ergonomic keyboard.
				</p>
			</div>
			<div class="resume-card">
				<span class="card-title">Cloud Chamber</span>
				<p class="mt-1 text-xs text-[--tx-2]">
					Built a cloud chamber capable of visualizing radiation particles and cosmic rays.
				</p>
			</div>
			<div class="resume-card">
				<span class="card-title">Hand Wash Timer</span>
				<p class="mt-1 text-xs text-[--tx-2]">
					Device displaying proper handwashing steps and duration during COVID-19.
				</p>
			</div>
			<div class="resume-card">
				<span class="card-title">Web Development</span>
				<p class="mt-1 text-xs text-[--tx-2]">
					Built responsive websites using Svelte and SvelteKit frameworks.
				</p>
			</div>
		</div>
		<a href="/projects" class="mt-4 inline-block text-xs text-[--tx-2] hover:text-[--cy]"
			>View all projects →</a
		>
	</div>

	<!-- Volunteer & Activities -->
	<div class="resume-section animate-fade-in animate-delay-5 mt-6">
		<h2 class="section-heading">// VOLUNTEER & ACTIVITIES</h2>
		<div class="volunteer-grid">
			<div class="resume-card">
				<div class="card-header">
					<span class="card-title">Grace Foundation</span>
					<span class="card-date">2022 - Present</span>
				</div>
				<p class="mt-1 text-xs text-[--tx-2]">
					Volunteered at fundraising runs for cancer treatment awareness. Assisted with event
					coordination.
				</p>
			</div>
			<div class="resume-card">
				<div class="card-header">
					<span class="card-title">Community Fundraisers</span>
					<span class="card-date">2022 - Present</span>
				</div>
				<p class="mt-1 text-xs text-[--tx-2]">
					Organized various fundraising events. Mobilized resources and coordinated volunteer
					efforts.
				</p>
			</div>
			<div class="resume-card">
				<div class="card-header">
					<span class="card-title">Astrophotography</span>
					<span class="card-date">2020 - Present</span>
				</div>
				<p class="mt-1 text-xs text-[--tx-2]">
					Self-taught astrophotography. Capturing astronomical phenomena and studying celestial
					bodies.
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	.resume-layout {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 var(--grid);
	}

	@media (min-width: 768px) {
		.resume-layout {
			padding: 0 calc(var(--grid) * 2);
		}
	}

	.resume-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: calc(var(--grid) * 3);
	}

	@media (min-width: 768px) {
		.resume-grid {
			grid-template-columns: 1fr 0.6fr;
		}
	}

	.resume-sidebar {
		display: flex;
		flex-direction: column;
		gap: calc(var(--grid) * 2);
	}

	.resume-section {
		display: flex;
		flex-direction: column;
		gap: calc(var(--grid) * 1.5);
	}

	.section-heading {
		font-size: 12px;
		font-weight: 700;
		color: var(--tx-2);
		margin: 0;
		letter-spacing: 0.05em;
	}

	.resume-card {
		padding: var(--grid);
		border: 1px solid var(--ui-3);
		transition: border-color 0.15s;
	}

	.resume-card:hover {
		border-color: var(--tx);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 8px;
	}

	.card-title {
		font-size: 14px;
		font-weight: 600;
	}

	.card-date {
		font-size: 11px;
		color: var(--tx-2);
		white-space: nowrap;
	}

	.card-org {
		font-size: 12px;
		color: var(--tx-2);
		display: block;
		margin-top: 2px;
	}

	.card-list {
		margin: 8px 0 0 0;
		padding-left: 16px;
		list-style: disc;
	}

	.card-list li {
		font-size: 12px;
		color: var(--tx-2);
		line-height: 1.6;
	}

	.skills-group {
		margin-bottom: calc(var(--grid) * 0.75);
	}

	.skills-group:last-child {
		margin-bottom: 0;
	}

	.score-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--grid);
	}

	@media (min-width: 640px) {
		.projects-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (min-width: 768px) {
		.projects-grid {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}

	.volunteer-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--grid);
	}

	@media (min-width: 768px) {
		.volunteer-grid {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}
</style>
