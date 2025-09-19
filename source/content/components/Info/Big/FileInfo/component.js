import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import ClassNames from 'classnames';

const Component = function({
    bitrate,
    size,
    name,
    url,
    //onDownloadFile,
}) {
    const high = bitrate > 300;
    const medium = bitrate > 128 && bitrate < 300;
    const low = bitrate <= 128;
    const classes = ClassNames('file-info', { high, medium, low });

    if (!bitrate) {
        return null;
    }

    return (
        <div styleName="file">
            <div
                // onClick={onDownloadFile.bind(null, { name, url })}
                styleName={classes}
            >
                <em>{bitrate}kb</em>
                {/*Скачать*/}
            </div>
            <b styleName="size">{size}</b>
        </div>
    );
};

export default CSSModules(Component, styles, { allowMultiple: true });
