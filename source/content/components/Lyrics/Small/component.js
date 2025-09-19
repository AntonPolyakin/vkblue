import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

export const SmallLyrics = CSSModules(
    ({ text }) => {
        return (
            <div styleName="wrapper">
                <div styleName="content">
                    <span>Слова песни</span>
                    {!text || (typeof text === 'string' && text.indexOf('title="Special:Random"') > 0) ? (
                        <p styleName="text">Не в этой песне... </p>
                    ) : (
                        <p styleName="text" dangerouslySetInnerHTML={{ __html: text }} />
                    )}
                </div>
            </div>
        );
    },
    styles,
    { allowMultiple: true },
);
