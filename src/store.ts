import type { InteractionsState } from "./render/Interactions";
import type { TowerId } from "./domain/towers";

export type TowerState = { active: TowerId };
export type TowerSlice = { tower: TowerState };
export type InteractionsSlice = { interactions: InteractionsState };
export type State = TowerSlice & InteractionsSlice;
export type Store = IStore<State>;

type Subscriber = () => void;
type Unsubscribe = () => void;
export type IStore<State extends Record<string, unknown>> = {
	getState(): State;
	setState(fn: (prev: State) => State): void;
	subscribe(fn: Subscriber): Unsubscribe;
};

export const storeFactory = <S extends Record<string, unknown>>(
	init: S,
): IStore<S> => {
	let state = init;
	const subscriptions: Subscriber[] = [];

	return {
		getState() {
			return state;
		},
		setState(fn: (prev: S) => S) {
			state = fn(state);
			subscriptions.forEach((fn) => fn());
		},
		subscribe(fn: Subscriber) {
			subscriptions.push(fn);
			return () => {
				const idx = subscriptions.indexOf(fn);
				if (idx >= 0) {
					subscriptions.splice(idx, 1);
				}
			};
		},
	};
};

export const subStore = <S extends Record<string, unknown>, K extends keyof S>(
	store: IStore<S>,
	key: K,
): IStore<S[K]> => {
	const subscriptions: Subscriber[] = [];
	return {
		subscribe(fn) {
			subscriptions.push(fn);
			return () => {
				const idx = subscriptions.indexOf(fn);
				if (idx >= 0) {
					subscriptions.splice(idx, 1);
				}
			};
		},
		getState: () => store.getState()[key],
		setState: (fn: (prev: S[K]) => S[K]) => {
			store.setState((s) => ({ ...s, [key]: fn(s[key]) }));
			subscriptions.forEach((fn) => fn());
		},
	};
};

type Reducer<State, Action> = (state: State, action: Action) => State;
export const makeDispatcher =
	<State extends Record<string, unknown>, Action extends { type: string }>(
		store: IStore<State>,
		reducer: Reducer<State, Action>,
	) =>
	(action: Action) =>
		store.setState((prev) => reducer(prev, action));
