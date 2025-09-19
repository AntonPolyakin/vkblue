import React, { useState } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import getGenres from '../../selectors/getGenres';
import closeLightBox from '../../actions/closeLightBox';
import { addPreset } from '../../../actionCreators/presets';

const AddPreset = ({ genres, closeLightBox, addPreset }) => {
    const [editingName, setEditingName] = useState('');
    const [editingGenres, setEditingGenres] = useState('');

    return (
        <div styleName="save-preset-wrapper">
            <div styleName="title-preset">
                <span>Укажите название для настроек</span>
            </div>
            <div styleName="save-preset">
                <span>Название настройки</span>
                <input
                    value={editingName}
                    onChange={event => setEditingName(event.target.value)}
                    type="text"
                    placeholder="Super Bass"
                />
                <span>
                    Теги для автонастройки <em>(опционально)</em>
                </span>
                <input
                    value={editingGenres}
                    onChange={event => setEditingGenres(event.target.value)}
                    type="text"
                    placeholder="electronic, dance"
                />
                <div styleName="current-genres">
                    <h4>Теги текущей песни:</h4>
                    <span>{genres.join(', ')}</span>
                </div>
            </div>

            <div styleName="buttons">
                <span styleName="cancel-button" onClick={closeLightBox}>
                    Отменить
                </span>
                <span
                    styleName="save-button"
                    className="flat_button"
                    onClick={() => {
                        if (editingName.length < 1) {
                            return;
                        }

                        addPreset(editingName, editingGenres);
                        closeLightBox();
                    }}
                >
                    Coхранить
                </span>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    genres: getGenres(state),
});

const mapDispatchToProps = {
    closeLightBox,
    addPreset,
};
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CSSModules(AddPreset, styles, { allowMultiple: true }));
