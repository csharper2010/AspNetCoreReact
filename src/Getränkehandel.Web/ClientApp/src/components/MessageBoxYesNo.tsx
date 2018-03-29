import * as React from 'react';
import { CommonProps, Navigator, addRenderer } from '../Navigator';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

export enum MessageBoxYesNoButton {
    Yes,
    No,
}

interface MessageBoxYesNoProps {
    title: string;
    children?: React.ReactNode;
    defaultButton?: MessageBoxYesNoButton;
    actions: MessageBoxYesNoActions;
}

interface MessageBoxYesNoActions {
    result(button: MessageBoxYesNoButton): void;
}

const rendererKey = 'MessageBoxYesNo';

class MessageBoxYesNoWF implements MessageBoxYesNoActions {
    private result$ = new Subject<MessageBoxYesNoButton>();
    private reducer$: Observable<(prevState: MessageBoxYesNoProps) => MessageBoxYesNoProps>;

    public constructor(nav: Navigator, title: string, content: React.ReactNode) {
        this.reducer$ = this.getReducer();
        nav.pushModal(this.reducer$, { title, children: content, actions: this }, rendererKey);
    }

    result(button: MessageBoxYesNoButton): void {
        this.result$.next(button);
        this.result$.complete();
    }

    async waitForResult(): Promise<MessageBoxYesNoButton> {
        return await this.result$.toPromise();
    }

    private getReducer(): Observable<(prevState: MessageBoxYesNoProps) => MessageBoxYesNoProps> {
        return new Subject<(prevState: MessageBoxYesNoProps) => MessageBoxYesNoProps>()
            .takeUntil(this.result$);
    }
}

export class MessageBoxYesNo {
    public static async show(nav: Navigator, title: string, content: React.ReactNode): Promise<MessageBoxYesNoButton> {
        return await new MessageBoxYesNoWF(nav, title, content).waitForResult();
    }
}

const MessageBoxYesNoComponent = (props: MessageBoxYesNoProps & CommonProps) => {
    let defaultBtn = props.defaultButton !== undefined ? props.defaultButton : MessageBoxYesNoButton.No;

    return (
        <div className="modal active" id="modal-id">
            <a 
                href="javascript:void(0)" 
                className="modal-overlay" 
                aria-label="Close" 
                onClick={e => { e.preventDefault(); return props.actions.result(defaultBtn); }} 
                tabIndex={-1}
            />
            <div className="modal-container">
                <div className="modal-header">
                    <a
                        href="javascript:void(0)"
                        className="btn btn-clear float-right"
                        aria-label="Close" 
                        onClick={e => { e.preventDefault(); props.actions.result(defaultBtn); }}
                    />
                    <div className="modal-title h5">{props.title}</div>
                </div>
                <div className="modal-body">
                    <div className="content">
                    {props.children}
                    </div>
                </div>
                <div className="modal-footer">
                    <>
                    {
                        [
                            { label: 'Ja', btn: MessageBoxYesNoButton.Yes },
                            { label: 'Nein', btn: MessageBoxYesNoButton.No },
                        ].map(obj => 
                            <button
                                key={obj.label}
                                className={'btn' + (defaultBtn === obj.btn ? ' btn-primary' : '')}
                                autoFocus={defaultBtn === obj.btn}
                                onClick={(e) => { e.preventDefault(); props.actions.result(obj.btn); }}
                            >{obj.label}
                            </button>)
                    }
                    </>
                </div>
            </div>
        </div>
    );
};

addRenderer(rendererKey, MessageBoxYesNoComponent);