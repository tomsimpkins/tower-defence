export type QueueItem = { value: number; id: number };
// todo: create tests for this class
export class MinPriorityQueue<T extends QueueItem> {
	private queue: T[] = [];

	length(): number {
		return this.queue.length;
	}

	push(item: T): void {
		this.queue.push(item);
		let i = this.queue.length - 1;

		while (i > 0) {
			const p = (i - 1) >> 1;
			if (this.queue[i].value >= this.queue[p].value) {
				break;
			}

			[this.queue[i], this.queue[p]] = [this.queue[p], this.queue[i]];
			i = p;
		}
	}

	pop(): T | undefined {
		if (!this.queue.length) {
			return undefined;
		}

		const top = this.queue[0];
		const last = this.queue.pop()!;

		if (this.queue.length) {
			this.queue[0] = last;

			let i = 0;
			while (true) {
				let l = i * 2 + 1;
				let r = i * 2 + 2;
				let m = i;
				if (
					l < this.queue.length &&
					this.queue[l].value < this.queue[m].value
				) {
					m = l;
				}
				if (
					r < this.queue.length &&
					this.queue[r].value < this.queue[m].value
				) {
					m = r;
				}
				if (m === i) break;
				[this.queue[i], this.queue[m]] = [this.queue[m], this.queue[i]];
				i = m;
			}
		}

		return top;
	}
}
