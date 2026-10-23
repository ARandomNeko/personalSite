// OpenSSH's “drunken bishop”: four diagonal moves per byte, on a 17×9 board.
export function randomart(bytes: Uint8Array): string {
	const width = 17;
	const height = 9;
	const ink = ' .o+=*BOX@%&#/^';
	const board = Array.from({ length: height }, () => Array<number>(width).fill(0));
	const startX = Math.floor(width / 2);
	const startY = Math.floor(height / 2);
	let x = startX;
	let y = startY;
	for (const byte of bytes) {
		for (let shift = 0; shift < 8; shift += 2) {
			const step = (byte >> shift) & 3;
			x = Math.max(0, Math.min(width - 1, x + (step & 1 ? 1 : -1)));
			y = Math.max(0, Math.min(height - 1, y + (step & 2 ? 1 : -1)));
			board[y][x]++;
		}
	}
	const rows = board.map((row) => row.map((count) => ink[Math.min(count, ink.length - 1)]));
	rows[startY][startX] = 'S';
	rows[y][x] = 'E';
	const border = `+${'-'.repeat(width)}+`;
	return [border, ...rows.map((row) => `|${row.join('')}|`), border].join('\n');
}
