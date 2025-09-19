import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import browser from 'webextension-polyfill';

const manifest = browser.runtime.getManifest();

const Component = function({ onOpenConfig, onHidePlayerView }) {
    return (
        <div styleName="wrapper">
            <div styleName="container">
                <div styleName="icon_wrapper" />
                <div styleName="info_wrapper">
                    <h2>{manifest.short_name}</h2>
                    <p>Вторая жизнь для вашей музыки!</p>
                </div>
                <div styleName="instructions">
                    <h1 styleName="title">НЕТ ВОЙНЕ</h1>
                </div>
            </div>
            <ul styleName="links">
                <li>
                    <a onClick={onHidePlayerView} styleName="hide">
                        Скрыть плеер
                    </a>
                </li>
                <li>
                    <a onClick={onOpenConfig} styleName="settings">
                        Настройки
                    </a>
                </li>
                <li>
                    <a href={manifest.homepage_url} styleName="group" target="_blank" rel="noopener noreferrer">
                        Группа ВКонтакте
                    </a>
                </li>
                <li>
                    <a
                        href={
                            process.env.BROWSER === 'firefox'
                                ? 'https://addons.mozilla.org/en-US/firefox/addon/vk-blue/'
                                : 'https://goo.gl/snZfe4'
                        }
                        styleName="rate"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        Написать отзыв
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default CSSModules(Component, styles);
