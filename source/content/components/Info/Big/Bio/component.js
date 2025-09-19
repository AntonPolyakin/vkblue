import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import lodashTruncate from 'lodash/truncate';

const Component = function({ bio, name, album, link, onSearchAlbum, genres }) {
    return (
        <div styleName="bio">
            <div styleName="summary">
                <span styleName="name">{lodashTruncate(name, { length: 20, omission: '..' })}</span>
                {album ? (
                    <div styleName="album">
                        <span key="label_album" styleName="label">
                            Album:
                        </span>
                        <span
                            key="title_album"
                            onClick={onSearchAlbum.bind(null, `${name} ${album}`)}
                            styleName="title"
                        >
                            {lodashTruncate(album, { length: 15, omission: '..' })}
                        </span>
                    </div>
                ) : null}
                {genres.length ? (
                    <div styleName="genres">
                        Теги: <span>{genres.join(', ')}</span>
                    </div>
                ) : null}
                {bio ? <p dangerouslySetInnerHTML={{ __html: bio }} /> : null}
                {link ? (
                    <a href={link} target="_blank">
                        Инфо на Last.fm
                    </a>
                ) : null}
            </div>
        </div>
    );
};

export default CSSModules(Component, styles);
