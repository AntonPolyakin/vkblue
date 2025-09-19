import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

class Select extends Component {
    static defaultProps = {};

    onSelect(index) {
        this.props.onChange(index);
    }

    onDelete(index) {
        this.props.onDelete(index);
    }

    render() {
        const { onSelect, onDelete } = this;
        const { selected, presets } = this.props;

        return (
            <div styleName="select-wrapper" tabIndex="-1">
                <span styleName="select-input">{presets[selected] ? presets[selected].name : 'custom'}</span>
                <ul styleName="select-list">
                    {presets.map(({ name, custom }, index) => {
                        return (
                            <li onClick={onSelect.bind(this, index)} styleName="select-list-item" key={name}>
                                <span>{name}</span>
                                {custom ? (
                                    <span onClick={onDelete.bind(this, index)} styleName="select-list-item-delete" />
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }
}

export default CSSModules(Select, styles, { allowMultiple: true });
