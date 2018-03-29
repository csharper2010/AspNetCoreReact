import * as React from 'react';
import 'isomorphic-fetch';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/timer';

import './ArtikelSuchen.css';

import { Navigator, CommonProps, addRenderer } from '../Navigator'; 
import { MessageBoxYesNo, MessageBoxYesNoButton } from './MessageBoxYesNo';
import { ProgressWithCancel } from './ProgressWithCancel';

interface Artikel {
    id: string;
    bezeichnung: string;
    bezeichnungKurz: string;
    kurzCode: string;
    aktiv: boolean;
}

export interface ArtikelSuchenProps {
    searchString: string;
    prevSearchString?: string;
    searchResult: Array<Artikel>;
    actions: ArtikelSuchenActions;
}

interface ArtikelSuchenActions {
    setSearchString(searchString: string): void;
    startSearch(searchString: string): void;
    deleteArtikel(id: string): void;
    close(): void;
}

const rendererKey = 'ArtikelSuchen';

class ArtikelSuchenWF implements ArtikelSuchenActions {
    private navigator: Navigator;

    private setSearchString$ = new Subject<{ searchString: string }>();
    private startSearch$ = new Subject<{ searchString: string }>();
    private setSearchResult$ = new Subject<{ searchResult: Array<Artikel> }>();
    private deleteArtikel$ = new Subject<{ id: string }>();
    private rezeptDeleted$ = new Subject<{ id: string }>();
    private close$ = new Subject<{}>();

    private reducer$: Observable<(prevState: ArtikelSuchenProps) => ArtikelSuchenProps>;

    public constructor(nav: Navigator) {
        this.navigator = nav;
        this.reducer$ = this.getReducer();
        nav.pushNonModal(this.reducer$, {searchString: '', searchResult: [], actions: this}, rendererKey);

        this.setSearchString$.debounceTime(500)
            .takeUntil(this.close$).subscribe(payload => {
                this.startSearch(payload.searchString);
        });
    }

    async waitForExit(): Promise<void> {
        await this.reducer$.toPromise();
    }

    setSearchString(searchString: string): void {
        this.setSearchString$.next({ searchString });
    }

    async startSearch(searchString: string) {
        this.startSearch$.next({ searchString });
        const response = await fetch('/api/artikel?suchbegriff=' + (encodeURI(searchString) || ''));
        if (response.status >= 400) {
            throw new Error('Bad response from server');
        }
        const result = await response.json();
        this.setSearchResult$.next({ searchResult: result });
    }

    async deleteArtikel(id: string) {
        this.deleteArtikel$.next({ id });
        const result = await MessageBoxYesNo.show(this.navigator, 'Artikel löschen?', 'Wollen Sie den Artikel wirklich löschen?');
        if (result === MessageBoxYesNoButton.Yes) {
            const {wasCancelled} = await ProgressWithCancel.show(
                this.navigator, 'Lösche Artikel', 'Artikel wird gelöscht', 100, Observable.timer(100, 100).take(10).map(n => n * 10)
            );
            if (!wasCancelled) {
                const response = await fetch('/api/artikel/' + (encodeURI(id)), { method: 'DELETE' });
                if (response.status >= 400) {
                    throw new Error('Bad response from server');
                }
                this.rezeptDeleted$.next({ id });
            }
        }
    }

    async close() {
        this.close$.next();
    }

    private getReducer(): Observable<(prevState: ArtikelSuchenProps) => ArtikelSuchenProps> {
        return this.setSearchString$.map(payload => (prevState: ArtikelSuchenProps) => ({
            ...prevState,
            searchString: payload.searchString,
        })).merge(
            this.setSearchResult$.map(payload => (prevState: ArtikelSuchenProps) => ({
                ...prevState,
                searchResult: payload.searchResult,
            })),
            this.rezeptDeleted$.map(payload => (prevState: ArtikelSuchenProps) => ({
                ...prevState,
                searchResult: prevState.searchResult.filter(r => r.id !== payload.id),
            })),
        ).takeUntil(this.close$);
    }
}

export class ArtikelSuchen {
    public static async show(nav: Navigator): Promise<void> {
        return await new ArtikelSuchenWF(nav).waitForExit();
    }
}

const ArtikelSuchenComponent = (props: ArtikelSuchenProps & CommonProps) => (
    <form onSubmit={event => { event.preventDefault(); props.actions.startSearch(props.searchString); }}>
        <div id="artikelSuchen">
            <div id="artikelSuchenTop" className="container columns">
                <h1 className="col-11">Artikel suchen</h1>
                <button
                    className="btn"
                    type="button"
                    onClick={event => { event.preventDefault(); props.actions.close(); }}
                    {... getTabstopp(props)}
                >Schließen
                </button>
                <input
                    type="text"
                    value={
                        props.searchString
                    }
                    onChange={
                        event => props.actions.setSearchString(event.target.value)
                    } 
                    className="form-input col-6"
                    placeholder="Search Text" 
                    {... getTabstopp(props)}
                    autoFocus={!props.inert}
                />
                <button className="btn btn-primary" type="submit" {... getTabstopp(props)}>Suchen</button>
            </div>
            <div id="artikelSuchenResult" style={{'overflow': 'auto'}} tabIndex={0}>
                {renderTable(props)}
            </div>
            <label id="artikelSuchenFooter" className="form-label">{props.searchResult.length} Zeilen gefunden</label>
        </div>
    </form>
);

function getTabstopp(props: CommonProps): {} {
    if (props.inert) {
        return { tabIndex: -1 };
    } else {
        return {};
    }
}

function renderTable(props: ArtikelSuchenProps & CommonProps) {
    if (props.searchResult && props.searchResult.length > 0) {
        return (
            <table className="table table-striped table-hover">
                <colgroup>
                    <col />
                    <col />
                    <col width="50"/>
                </colgroup>
                <thead>
                    <tr>
                        <th>Bezeichnung</th>
                        <th>Kurzbezeichnung</th>
                        <th>Kurzcode</th>
                        <th>Aktiv</th>
                        <th/>
                    </tr>
                </thead>
                <tbody>
                {props.searchResult.map(r => 
                    <tr key={r.id}>
                        <td>{r.bezeichnung}</td>
                        <td>{r.bezeichnungKurz}</td>
                        <td>{r.kurzCode}</td>
                        <td>{r.aktiv}</td>
                        <td>
                            <button
                                className="btn btn-primary btn-action"
                                onClick={e => props.actions.deleteArtikel(r.id)}
                                {... getTabstopp(props)}
                            ><i className="icon icon-delete" />
                            </button>
                        </td>
                    </tr>)}
                </tbody>
            </table>
        );
    } else {
        return <></>;
    }
}

addRenderer(rendererKey, ArtikelSuchenComponent);