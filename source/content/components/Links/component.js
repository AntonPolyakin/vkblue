import browser from 'webextension-polyfill';
import React from 'react';
import CSSModules from 'react-css-modules';
import ClassNames from 'classnames';
import styles from './styles.scss';

const manifest = browser.runtime.getManifest();

const Links = function({ onOpenInfo, onOpenConfig, onOpenHelp, onOpenPro }) {
    return (
        <div styleName="links_block" id="vk_blue_links">
            <h4>
                {manifest.short_name}
                <span>pro</span>
            </h4>
            <a href={manifest.homepage_url} className={ClassNames(styles.group, styles.link)} target="_blank">
                Группа ВКонтакте
            </a>
            <a href="https://goo.gl/snZfe4" className={ClassNames(styles.rate, styles.link)} target="_blank">
                Написать отзыв
            </a>
            <a className={ClassNames(styles.help, styles.link)} onClick={onOpenHelp}>
                Помочь проекту
            </a>
            <div className={ClassNames(styles.settings_container, styles.link)}>
                <a onClick={onOpenConfig} className={ClassNames(styles.settings)}>
                    Настройки
                </a>
                <a className={ClassNames(styles.info)} onClick={onOpenInfo}>
                    Информация
                </a>
            </div>
        </div>
    );
};

export default CSSModules(Links, styles);
