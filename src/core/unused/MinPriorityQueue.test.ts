import { expect, test } from "bun:test";
import { MinPriorityQueue } from "./MinPriorityQueue";

test("pop returns items in ascending order", () => {
	const queue = new MinPriorityQueue<{ value: number; id: number }>();
	[
		{ value: 5, id: 1 },
		{ value: 1, id: 2 },
		{ value: 3, id: 3 },
		{ value: 2, id: 4 },
		{ value: 4, id: 5 },
	].forEach((item) => queue.push(item));

	const poppedValues: number[] = [];
	let item: { value: number; id: number } | undefined;
	while ((item = queue.pop())) {
		poppedValues.push(item.value);
	}

	expect(poppedValues).toEqual([1, 2, 3, 4, 5]);
});

test("length reflects the number of queued items", () => {
	const queue = new MinPriorityQueue<{ value: number; id: number }>();

	expect(queue.length()).toBe(0);

	queue.push({ value: 10, id: 1 });
	queue.push({ value: -5, id: 2 });
	expect(queue.length()).toBe(2);

	queue.pop();
	expect(queue.length()).toBe(1);

	queue.pop();
	expect(queue.length()).toBe(0);
});

test("pop on an empty queue returns undefined", () => {
	const queue = new MinPriorityQueue<{ value: number; id: number }>();

	expect(queue.pop()).toBeUndefined();
});
