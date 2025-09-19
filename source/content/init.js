import React from 'react';
import { MutationSummary } from 'mutation-summary';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import MainPlayer from './components/Players/Main';
import TopPlayer from './components/Players/Top';
import PanelButtons from './components/PanelButtons';
import LastFMButtons from './components/LastFM';

import Portal from './components/Portal/index';
import HeaderVisualizer from './components/HeaderVisualizer/component';

import { store } from '../store/index';
import Lightbox from './components/Lightbox/component';

const App = () => [
    <Provider key="main" store={store}>
        <Lightbox />
    </Provider>,
    <Portal key="header-visualizer" place="header-visualizer">
        <Provider store={store}>
            <HeaderVisualizer />
        </Provider>
    </Portal>,
    <Portal key="main-player" place="main-player">
        <Provider store={store}>
            <MainPlayer />
        </Provider>
    </Portal>,
    <Portal key="top-player" place="top-player">
        <Provider store={store}>
            <TopPlayer />
        </Provider>
    </Portal>,
    <Portal key="panel-buttons" place="panel-buttons">
        <Provider store={store}>
            <PanelButtons />
        </Provider>
    </Portal>,
    <Portal key="lastfm-buttons" place="lastfm-buttons">
        <Provider store={store}>
            <LastFMButtons />
        </Provider>
    </Portal>,
];

const ID = 'vk-blue-main-' + Math.random();

const observer = new MutationSummary({
    callback: summaries => {
        summaries.forEach(summary => {
            summary.added.forEach(body => {
                const container = window.document.createElement('div');
                container.id = ID;
                body.appendChild(container);

                render(<App />, container);
                observer.disconnect();
            });
        });
    },

    queries: [{ element: 'body' }],
});
