import * as React from 'react';
import 'isomorphic-fetch';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { merge } from 'rxjs/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/timer';

import './ArtikelDetails.css';

import { Navigator, CommonProps, addRenderer } from '../Navigator';
// import { MessageBoxYesNo, MessageBoxYesNoButton } from './MessageBoxYesNo';
// import { ProgressWithCancel } from './ProgressWithCancel';

import { Tabs, Tab } from './Tabs';

interface Artikel {
    id: string;
    bezeichnung: string;
    bezeichnungKurz: string;
    kurzCode: string;
    aktiv: boolean;
}

export interface ArtikelDetailsProps {
    artikel?: Artikel;
    actions: ArtikelDetailsActions;
}

interface ArtikelDetailsActions {
    close(): void;
}

const rendererKey = 'ArtikelDetails';

class ArtikelDetailsWF implements ArtikelDetailsActions {
    // private navigator: Navigator;

    private artikelLoaded$ = new Subject<{ artikel: Artikel }>();
    private close$ = new Subject<{}>();

    private reducer$: Observable<(prevState: ArtikelDetailsProps) => ArtikelDetailsProps>;

    public constructor(nav: Navigator, id: string) {
        // this.navigator = nav;
        this.reducer$ = this.getReducer();
        nav.pushNonModal(this.reducer$, { actions: this }, rendererKey);

        setTimeout(() => this.loadArtikel(id), 1000);
    }

    async waitForExit(): Promise<void> {
        await this.reducer$.toPromise();
    }

    async loadArtikel(id: string) {
        const response = await fetch('/api/artikel/' + (encodeURI(id)));
        if (response.status >= 400) {
            throw new Error('Bad response from server');
        }
        const result = await response.json();
        this.artikelLoaded$.next({ artikel: result });
    }

    async close() {
        this.close$.next();
    }

    private getReducer(): Observable<(prevState: ArtikelDetailsProps) => ArtikelDetailsProps> {
        return merge(
            this.artikelLoaded$.map(payload => (prevState: ArtikelDetailsProps) => ({
                ...prevState,
                artikel: payload.artikel,
            })),
        ).takeUntil(this.close$);
    }
}

export class ArtikelDetails {
    public static async show(nav: Navigator, id: string): Promise<void> {
        return await new ArtikelDetailsWF(nav, id).waitForExit();
    }
}

const ArtikelDetailsComponent = (props: ArtikelDetailsProps & CommonProps) => (
    <form>
        <div id="artikelDetails">
            <div id="artikelDetailsTop" className="container columns">
                <h1 className="col-11">Artikeldetails</h1>
                <button
                    className="btn"
                    type="button"
                    onClick={event => { event.preventDefault(); props.actions.close(); }}
                    {...getTabstopp(props)}
                >Schließen
                </button>
            </div>
            <div id="artikelDetailsResult">
                {renderArtikel(props.artikel)}
            </div>
            <label id="artikelDetailsFooter" className="form-label">a</label>
        </div>
    </form>
);

function renderArtikel(artikel?: Artikel) {
    if (artikel === undefined) {
        return (
            <div className="has-icon-left">
                <label>Daten werden geladen</label>
                <i className="form-icon loading"/>
            </div>);
    } else {
        return (
            <Tabs>
                <Tab
                    title="Stammdaten"
                    hotKey="S"
                    content={<div><label>Bezeichnung: </label><label>{artikel.bezeichnung}</label></div>}
                />
                <Tab
                    title="Gebinde"
                    hotKey="G"
                    content={<div>TODO</div>}
                />
            </Tabs>
        );
    }
}

function getTabstopp(props: CommonProps): {} {
    if (props.inert) {
        return { tabIndex: -1 };
    } else {
        return {};
    }
}

addRenderer(rendererKey, ArtikelDetailsComponent);