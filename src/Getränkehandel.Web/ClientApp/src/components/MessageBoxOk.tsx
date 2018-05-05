import * as React from 'react';
import { CommonProps, Navigator, addRenderer } from '../Navigator';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

interface MessageBoxOkProps {
    title: string;
    children?: React.ReactNode;
    actions: MessageBoxOkActions;
}

interface MessageBoxOkActions {
    close(): void;
}

const rendererKey = 'MessageBoxOk';

class MessageBoxOkWF implements MessageBoxOkActions {
    private result$ = new Subject<{}>();
    private reducer$: Observable<(prevState: MessageBoxOkProps) => MessageBoxOkProps>;

    public constructor(nav: Navigator, title: string, content: React.ReactNode) {
        this.reducer$ = this.getReducer();
        nav.pushModal(this.reducer$, { title, children: content, actions: this }, rendererKey);
    }

    close(): void {
        this.result$.complete();
    }

    async waitForResult(): Promise<{}> {
        return await this.result$.toPromise();
    }

    private getReducer(): Observable<(prevState: MessageBoxOkProps) => MessageBoxOkProps> {
        return new Subject<(prevState: MessageBoxOkProps) => MessageBoxOkProps>()
            .takeUntil(this.result$);
    }
}

export class MessageBoxOk {
    public static async show(nav: Navigator, title: string, content: React.ReactNode): Promise<{}> {
        return await new MessageBoxOkWF(nav, title, content).waitForResult();
    }
}

const MessageBoxOkComponent = (props: MessageBoxOkProps & CommonProps) => {
    return (
        <div className="modal active" id="modal-id">
            <a
                href="javascript:void(0)"
                className="modal-overlay"
                aria-label="Close"
                onClick={e => { e.preventDefault(); return props.actions.close(); }}
                tabIndex={-1}
            />
            <div className="modal-container">
                <div className="modal-header">
                    <a
                        href="javascript:void(0)"
                        className="btn btn-clear float-right"
                        aria-label="Close"
                        onClick={e => { e.preventDefault(); props.actions.close(); }}
                    />
                    <div className="modal-title h5">{props.title}</div>
                </div>
                <div className="modal-body">
                    <div className="content">
                        {props.children}
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        className="btn btn-primary"
                        autoFocus={true}
                        onClick={(e) => { e.preventDefault(); props.actions.close(); }}
                    >OK
                    </button>
                </div>
            </div>
        </div>
    );
};

addRenderer(rendererKey, MessageBoxOkComponent);