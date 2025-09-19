import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

const Empty = function(props) {
    return (
        <div styleName="wrapper">
            <div styleName="text" dangerouslySetInnerHTML={{ __html: props.text || 'Empty' }} />
        </div>
    );
};

export default CSSModules(Empty, styles);
