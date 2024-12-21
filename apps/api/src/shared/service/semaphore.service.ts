export class SemaphoreService {
	private busy = false;
	private queue: (() => void)[] = [];

	async acquire(): Promise<void> {
		if (this.busy) {
			return new Promise((resolve) => this.queue.push(resolve));
		}

		this.busy = true;
	}

	release(): void {
		const nextResolve = this.queue.shift();

		if (nextResolve === undefined) {
			this.busy = false;
		} else {
			nextResolve();
		}
	}
}
