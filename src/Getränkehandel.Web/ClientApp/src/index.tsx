import './polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import ApplicationFrame from './ApplicationFrame';

import './css/styles.css';

// import registerServiceWorker from './registerServiceWorker';

// tslint:disable-next-line

function renderApp() {
    ReactDOM.render(
        <AppContainer>
            <ApplicationFrame />
        </AppContainer>,
        document.getElementById('root')
    );
}

renderApp();

// registerServiceWorker();
