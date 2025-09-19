import React from 'react';
import CSSModules from 'react-css-modules';
import ClassNames from 'classnames';
import styles from './styles.scss';

const Component = function({ value, onChange, children, name, className }) {
    const handlerOnClick = function(event) {
        if (typeof onChange === 'function') {
            onChange({ value: !value, name });
        }
    };

    return (
        <span className={className} styleName={ClassNames('checkbox-wrapper', { checked: value })}>
            <span styleName="checkbox-input" onClick={handlerOnClick} />
            <span styleName="checkbox-label" onClick={handlerOnClick}>
                {children}
            </span>
        </span>
    );
};

export default CSSModules(Component, styles, { allowMultiple: true });
