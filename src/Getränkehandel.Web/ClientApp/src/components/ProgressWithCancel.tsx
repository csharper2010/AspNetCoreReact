import * as React from 'react';
import { CommonProps, Navigator, addRenderer } from '../Navigator';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

interface ProgressWithCancelProps {
    title: string;
    children?: React.ReactNode;
    progressValue?: number;
    maxValue: number;
    actions: ProgressWithCancelActions;
}

interface ProgressWithCancelActions {
    cancel(): void;
}

const rendererKey = 'ProgressWithCancel';

class ProgressWithCancelWF implements ProgressWithCancelActions {
    private result$ = new Subject<{ wasCancelled: boolean }>();
    private reducer$: Observable<(prevState: ProgressWithCancelProps) => ProgressWithCancelProps>;

    public constructor(nav: Navigator, title: string, content: React.ReactNode, maxValue: number, progressValue$: Observable<number>) {
        this.reducer$ = this.getReducer(progressValue$);
        progressValue$.subscribe(n => undefined, e => undefined, () => {
            if (!this.result$.closed) {
                this.result$.next({ wasCancelled: false });
                this.result$.complete();
            }
        });
        nav.pushModal(this.reducer$, { title, children: content, maxValue, actions: this }, rendererKey);
    }

    cancel(): void {
        this.result$.next({ wasCancelled: true });
        this.result$.complete();
    }

    async waitForResult(): Promise<{ wasCancelled: boolean }> {
        return await this.result$.toPromise();
    }

    private getReducer(progressValue$: Observable<number>) {
        return progressValue$
            .map(payload => (prevState: ProgressWithCancelProps) => ({
                ...prevState,
                progressValue: payload,
            }))
            .takeUntil(this.result$);
    }
}

export class ProgressWithCancel {
    public static async show(nav: Navigator, title: string, content: React.ReactNode, maxValue: number, progressValue$: Observable<number>)
        : Promise<{ wasCancelled: boolean }> {
        return await new ProgressWithCancelWF(nav, title, content, maxValue, progressValue$).waitForResult();
    }
}

const ProgressWithCancelComponent = (props: ProgressWithCancelProps & CommonProps) => (
    <div className="modal active" id="modal-id">
        <a
            href="javascript:void(0)"
            className="modal-overlay"
            aria-label="Close"
            onClick={e => { e.preventDefault(); props.actions.cancel(); }}
            tabIndex={-1}
        />
        <div className="modal-container">
            <div className="modal-header">
                <a
                    href="javascript:void(0)"
                    className="btn btn-clear float-right"
                    aria-label="Close"
                    onClick={e => { e.preventDefault(); props.actions.cancel(); }}
                />
                <div className="modal-title h5">{props.title}</div>
            </div>
            <div className="modal-body">
                <div className="content">
                {props.children}
                </div>
                <progress className="progress" value={props.progressValue} max={props.maxValue}/>
            </div>
            <div className="modal-footer">
                <button
                    className="btn btn-primary"
                    autoFocus={true}
                    onClick={e => { e.preventDefault(); props.actions.cancel(); }}
                >Abbrechen
                </button>
            </div>
        </div>
    </div>
);

addRenderer(rendererKey, ProgressWithCancelComponent);