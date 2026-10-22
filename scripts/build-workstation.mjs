import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = resolve(root, 'workstation');
const targetDirectory = process.env.CARGO_TARGET_DIR
	? resolve(directory, process.env.CARGO_TARGET_DIR)
	: resolve(directory, 'target');
const development = process.argv.includes('--dev');
const run = (command, args, cwd = directory) => {
	const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
	if (result.error) {
		console.error(`Could not run ${command}: ${result.error.message}`);
		console.error('See workstation/README.md for the Rust/WASM toolchain setup.');
	}
	if (result.status !== 0) process.exit(result.status ?? 1);
};

run(process.execPath, [resolve(root, 'scripts/workstation-content.mjs')], root);
run('cargo', [
	'build',
	'--locked',
	'--target',
	'wasm32-unknown-unknown',
	...(development ? [] : ['--release'])
]);
mkdirSync(resolve(root, 'workstation/web/pkg'), { recursive: true });
run(process.env.WASM_BINDGEN || 'wasm-bindgen', [
	resolve(
		targetDirectory,
		'wasm32-unknown-unknown',
		development ? 'debug' : 'release',
		'divine_workstation.wasm'
	),
	'--out-dir',
	resolve(root, 'workstation/web/pkg'),
	'--target',
	'web'
]);
