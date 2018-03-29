import { ReactNode } from 'react';
import { v4 as uuid } from 'uuid';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/startWith';

const renderers = new Map<string, (props: CommonProps & any) => ReactNode>();

export function addRenderer<T>(key: string, renderer: (props: CommonProps & T) => ReactNode) {
    renderers.set(key, renderer);
}

function renderWithRendererKey<T>(rendererKey: string, state: T & CommonProps) {
    const renderer = renderers.get(rendererKey);
    return renderer && renderer(state);
}

export interface FrameContentState<T> {
    oid: string;
    modal: boolean;
    state?: T;
    render(commonProps: CommonProps & T): ReactNode;
}

class FrameContent<T extends Object> {
    constructor (
        public readonly state$: Observable<(prevState: T) => T>,
        private readonly initialState: T,
        private readonly modal: boolean,
        private readonly rendererKey: string,
    ) {
    }

    getInitialState(oid: string) {
        return {
            oid,
            state: this.initialState,
            modal: this.modal,
            render: (s: CommonProps & T) => renderWithRendererKey(this.rendererKey, s),
        };
    }
}

export interface NavigatorState {
    content: Array<FrameContentState<any>>;
}

export class Navigator {
    public state$: Observable<NavigatorState>;
    private source$: ReplaySubject<FrameContent<any>>;

    public constructor() {
        this.source$ = new ReplaySubject<FrameContent<any>>();
        this.state$ = 
            this.source$
                .mergeMap<FrameContent<any>, (s: NavigatorState) => NavigatorState>(
                    (obs: FrameContent<any>, index: number) => {
                        const oid = uuid();
                        return Observable.of((state: NavigatorState) => ({ content: state.content.concat([obs.getInitialState(oid)]) }))
                            .concat(
                                obs.state$
                                    .map<(prevState: any) => any, (s: NavigatorState) => NavigatorState>(
                                        payload => (state: NavigatorState) => ({ content: state.content.map(s => {
                                            if (s.oid === oid) {
                                                return {
                                                    ...s,
                                                    state: payload(s.state),
                                                };
                                            } else {
                                                return s;
                                            }
                                        }) })),
                                Observable.of((state: NavigatorState) => ({ content: state.content.filter(s => s.oid !== oid) })));
                    }
                )
                .scan(
                    (acc: NavigatorState, action: (s: NavigatorState) => NavigatorState) => action(acc),
                    { content: [] })
                .startWith({
                    content: [],
                });
    }

    pushNonModal<T>(state$: Observable<(prevState: T) => T>, initialState: T, rendererKey: string): void {
        let newItem = new FrameContent<T>(state$, initialState, false, rendererKey);
        this.source$.next(newItem);
    }

    pushModal<T>(state$: Observable<(prevState: T) => T>, initialState: T, rendererKey: string): void {
        let newItem = new FrameContent<T>(state$, initialState, true, rendererKey);
        this.source$.next(newItem);
    }
}

export interface CommonProps {
    navigator: Navigator;
    inert: boolean;
}