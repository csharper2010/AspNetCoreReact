import * as React from 'react';
import { CommonProps, Navigator, addRenderer } from '../Navigator';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/of';

import { ArtikelSuchen } from './ArtikelSuchen';

export interface MainMenuProps {
    actions: MainMenuActions;
}

interface MainMenuActions {
    showArtikelSuchen(e?: React.MouseEvent<HTMLElement>): void;
}

const rendererKey = 'MainMenu';

export class MainMenuWF implements MainMenuActions {
    public state$: Observable<(prevState: MainMenuProps) => MainMenuProps> = new Subject<(prevState: MainMenuProps) => MainMenuProps>();

    public constructor(private nav: Navigator) {
        nav.pushNonModal(this.state$, { actions: this }, rendererKey);
    }

    async showArtikelSuchen(e?: React.MouseEvent<HTMLElement>) {
        await ArtikelSuchen.show(this.nav);
    }
}

export class MainMenu {
    public static show(nav: Navigator) {
        return new MainMenuWF(nav);
    }
}

const MainMenuComponent = (props: MainMenuProps & CommonProps) => (
    <div>
        <button className="btn btn-primary" onClick={e => props.actions.showArtikelSuchen(e)}>Artikel suchen</button>
    </div>
);
    
addRenderer(rendererKey, MainMenuComponent);
