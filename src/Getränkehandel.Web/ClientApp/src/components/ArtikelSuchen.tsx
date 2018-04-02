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

import './ArtikelSuchen.css';

import { Navigator, CommonProps, addRenderer } from '../Navigator';
import { MessageBoxYesNo, MessageBoxYesNoButton } from './MessageBoxYesNo';
import { ProgressWithCancel } from './ProgressWithCancel';
import { ArtikelDetails } from './ArtikelDetails';
import { Grid, GridColumn } from './Grid';

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
    searchResult: {
        items: Array<Artikel>,
        selectedItemIndex?: number,
    };
    actions: ArtikelSuchenActions;
}

interface ArtikelSuchenActions {
    setSearchString(searchString: string): void;
    selectArtikel(id: string): void;
    startSearch(searchString: string): void;
    deleteArtikel(id: string): void;
    showArtikelDetails(id: string): void;
    close(): void;
}

const rendererKey = 'ArtikelSuchen';

class ArtikelSuchenWF implements ArtikelSuchenActions {
    private navigator: Navigator;

    private setSearchString$ = new Subject<{ searchString: string }>();
    private setSearchResult$ = new Subject<{ searchResult: Array<Artikel> }>();
    private artikelDeleted$ = new Subject<{ id: string }>();
    private selectArtikel$ = new Subject<{ id: string }>();
    private close$ = new Subject<{}>();

    private reducer$: Observable<(prevState: ArtikelSuchenProps) => ArtikelSuchenProps>;

    public constructor(nav: Navigator) {
        this.navigator = nav;
        this.reducer$ = this.getReducer();
        nav.pushNonModal(this.reducer$, { searchString: '', searchResult: { items: [] }, actions: this }, rendererKey);

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

    selectArtikel(id: string): void {
        this.selectArtikel$.next({ id });
    }

    async startSearch(searchString: string) {
        const response = await fetch('/api/artikel?suchbegriff=' + (encodeURI(searchString) || ''));
        if (response.status >= 400) {
            throw new Error('Bad response from server');
        }
        const result = await response.json();
        this.setSearchResult$.next({ searchResult: result });
    }

    async deleteArtikel(id: string) {
        const result = await MessageBoxYesNo.show(this.navigator, 'Artikel löschen?', 'Wollen Sie den Artikel wirklich löschen?');
        if (result === MessageBoxYesNoButton.Yes) {
            const { wasCancelled } = await ProgressWithCancel.show(
                this.navigator, 'Lösche Artikel', 'Artikel wird gelöscht', 100, Observable.timer(100, 100).take(10).map(n => n * 10)
            );
            if (!wasCancelled) {
                const response = await fetch('/api/artikel/' + (encodeURI(id)), { method: 'DELETE' });
                if (response.status >= 400) {
                    throw new Error('Bad response from server');
                }
                this.artikelDeleted$.next({ id });
            }
        }
    }

    async showArtikelDetails(id: string) {
        await ArtikelDetails.show(this.navigator, id);
    }

    async close() {
        this.close$.next();
    }

    private getReducer(): Observable<(prevState: ArtikelSuchenProps) => ArtikelSuchenProps> {
        return merge(
            this.setSearchString$.map(payload => (prevState: ArtikelSuchenProps) => ({
                ...prevState,
                searchString: payload.searchString,
            })),
            this.selectArtikel$.map(payload => (prevState: ArtikelSuchenProps) => ({
                ...prevState,
                searchResult: {
                    ...prevState.searchResult,
                    selectedItemIndex: prevState.searchResult.items.findIndex(a => a.id === payload.id),
                }
            })),
            this.setSearchResult$.map(payload => (prevState: ArtikelSuchenProps) => ({
                ...prevState,
                searchResult: {
                    items: payload.searchResult,
                    selectedItemIndex: payload.searchResult.length > 0 ? 0 : undefined,
                }
            })),
            this.artikelDeleted$.map(payload => (prevState: ArtikelSuchenProps) => ({
                ...prevState,
                searchResult: {
                    items: prevState.searchResult.items.filter(r => r.id !== payload.id),
                    selectedItemIndex: prevState.searchResult.selectedItemIndex === undefined
                        ? undefined
                        : (prevState.searchResult.items.length - 1 > prevState.searchResult.selectedItemIndex
                            ? prevState.searchResult.selectedItemIndex
                            : prevState.searchResult.selectedItemIndex - 1),
                }
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
                    {...getTabstopp(props)}
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
                    {...getTabstopp(props)}
                    autoFocus={!props.inert}
                />
                <button className="btn btn-primary" type="submit" {...getTabstopp(props)}>Suchen</button>
            </div>
            <div id="artikelSuchenResult">
                {renderTable(props)}
            </div>
            <label id="artikelSuchenFooter" className="form-label">{props.searchResult.items.length} Zeilen gefunden</label>
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
    if (props.searchResult.items && props.searchResult.items.length > 0) {
        return (
            <Grid
                items={props.searchResult.items}
                onDelete={(i) => props.actions.deleteArtikel(props.searchResult.items[i].id)}
                onAcceptSelection={(i) => props.actions.showArtikelDetails(props.searchResult.items[i].id)}
            >
                <GridColumn caption={'Bezeichnung'} content={(a: Artikel) => a.bezeichnung} />
                <GridColumn caption={'Kurzbezeichnung'} content={(a: Artikel) => a.bezeichnungKurz} />
                <GridColumn caption={'Kurzcode'} content={(a: Artikel) => a.kurzCode} />
                <GridColumn
                    caption={'Aktiv'}
                    content={(a: Artikel) => (
                        <label className="form-checkbox"><input type="checkbox" checked={a.aktiv} disabled={true} /><i className="form-icon" /></label>
                    )}
                    width={80}
                />
                <GridColumn
                    caption={''}
                    content={(a: Artikel) => (
                        <button
                            className="btn btn-primary btn-action"
                            onClick={e => props.actions.deleteArtikel(a.id)}
                            {...getTabstopp(props)}
                        ><i className="icon icon-delete" />
                        </button>
                    )}
                    width={50}
                />
            </Grid>
        );
    } else {
        return <></>;
    }
}

addRenderer(rendererKey, ArtikelSuchenComponent);