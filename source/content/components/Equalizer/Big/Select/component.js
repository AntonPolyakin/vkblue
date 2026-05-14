import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import {sortArrayOfObjects} from '../../../../../utils/js-utils';

class Select extends Component {
    static defaultProps = {};
    
    state = {
        opened: false
    };

    onSelect(index) {
        this.props.onChange(index);
    }

    onDelete(index) {
        this.props.onDelete(index);
    }

    toggleOpened = () => {
        this.setState((prev) => ({
            opened: !prev.opened
        }));
    };

    handleBlur = () => {
        this.setState({
            opened: false
        });
    };

    render() {
        const { onSelect, onDelete } = this;
        const { selected, presets } = this.props;
        const { opened } = this.state;

        let presetsArray = sortArrayOfObjects(Object.values(presets), [{ field: 'name' }]);
        let presetIds = Object.keys(presets);
        presetIds = presetsArray.map(preset=> presetIds.find(id=>presets[id] == preset));
        presetIds = [...new Set(['default', ...presetIds])];

        return (
            <div styleName="select-wrapper" className={opened ? styles.opened : ''} onBlur={this.handleBlur} tabIndex="-1">
                <span styleName="select-input" onClick={this.toggleOpened}>{presets[selected] ? presets[selected].name : 'custom'}</span>
                <ul styleName="select-list">
                    {presetIds.map((presetId, index) => {
                        let preset = presets[presetId];
                        let { name, custom } = preset;
                        return (
                            <li onClick={onSelect.bind(this, presetId)} styleName="select-list-item" key={presetId}>
                                <span>{name}</span>
                                {custom ? (
                                    <span onClick={onDelete.bind(this, presetId)} styleName="select-list-item-delete" />
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
