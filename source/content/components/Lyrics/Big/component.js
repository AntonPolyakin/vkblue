import React from 'react';
import CSSModules from 'react-css-modules';

import Empty from '../../Empty/component';

import styles from './styles.scss';

function formatLyrics(text = '') {
    return text
        .replace(/(\[[^\[\]]*\])/g, '<span class="lyrics-meta">$1</span>')
        .replace(/\n/g, '<br/>');
}

export const BigLyrics = CSSModules(
    ({ text }) => {
        if (!text || (typeof text === 'string' && text.indexOf('title="Special:Random"') > 0)) {
            return (
                <Empty
                    text={`Ой.. Нет слов :( <br/> Попробуйте добавить текст на <a href="https://www.genius.com" target="_blank">genius.com</a> чтобы мы могли найти его.`}
                />
            );
        }

        const html = typeof text === 'string' ? formatLyrics(text) : text;

        return (
            <div styleName="wrapper">
                <div styleName="content">
                    <p styleName="text" dangerouslySetInnerHTML={{ __html: html }} />
                </div>
            </div>
        );
    },
    styles,
    { allowMultiple: true },
);
