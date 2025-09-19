import React from 'react';
import CSSModules from 'react-css-modules';

import Empty from '../../Empty/component';

import styles from './styles.scss';

export const BigLyrics = CSSModules(
    ({ text }) => {
        if (!text || (typeof text === 'string' && text.indexOf('title="Special:Random"') > 0)) {
            return (
                <Empty
                    text={`Ой.. Нет слов :( <br/> Попробуйте добавить текст на <a href="https://www.genius.com" target="_blank">genius.com</a> или <a href="https://www.gl5.ru" target="_blank">gl5.ru</a><br/> чтобы мы могли найти его.`}
                />
            );
        }

        return (
            <div styleName="wrapper">
                <div styleName="content">
                    <p styleName="text" dangerouslySetInnerHTML={{ __html: text }} />
                </div>
            </div>
        );
    },
    styles,
    { allowMultiple: true },
);
