import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

const Component = function() {
    return (
        <div styleName="wrapper">
            <div styleName="loader" />
        </div>
    );
};

export default CSSModules(Component, styles);
