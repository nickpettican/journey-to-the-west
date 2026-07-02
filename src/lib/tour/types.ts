/** The handle every scroll-tour scene returns (Nālandā, Bodh Gayā, …). */
export interface SceneTour {
	setProgress(p: number): void;
	setStation(i: number): void;
	/** Measured scroll fractions of the story cards' centres (0–1). */
	calibrate(stationPs: number[]): void;
	resize(): void;
	dispose(): void;
}
