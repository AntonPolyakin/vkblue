import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import ClassNames from 'classnames';
import lodashTruncate from 'lodash/truncate';

const Component = function({
    bitrate,
    size,
    artistName,
    name,
    extended,
    // url,
    //onDownloadFile,
}) {
    const high = bitrate > 300;
    const medium = bitrate > 128 && bitrate < 300;
    const low = bitrate <= 128;
    const classes = ClassNames('file-info', { high, medium, low });

    return (
        <div styleName="file">
            <div styleName="bio">
                <span styleName="title">Биография</span>
                <strong styleName={ClassNames({ extended: extended })}>
                    {lodashTruncate(artistName, { length: extended ? 31 : 13, omission: '..' })}
                </strong>
            </div>
            {bitrate ? (
                <div // onClick={e => {
                    //     e.stopPropagation();
                    //     onDownloadFile({ name, url });
                    // }}
                    styleName={classes}
                >
                    <em>
                        <b>{bitrate}kb</b>
                    </em>
                    {size}
                    {/*Скачать*/}
                </div>
            ) : null}
        </div>
    );
};

export default CSSModules(Component, styles, { allowMultiple: true });
