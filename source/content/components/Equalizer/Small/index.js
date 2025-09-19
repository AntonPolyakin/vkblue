import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import { connect } from 'react-redux';
import { getEqualizerFilters } from '../../../../store/equalizer/selectors';
import { getPresetsPresets, getPresetsAuto, getPresetsCurrent } from '../../../../store/presets/selectors';

const HEIGHT = 100;
const WIDTH = 300;

const Component = function({ auto, values, currentName }) {
    let linePath = '';
    const arrayPath = [];
    const points = [];

    values.forEach(function(value, index) {
        let x = index * (WIDTH / values.length);
        let y = HEIGHT / 2 - (HEIGHT / 2) * value;

        linePath += `${x},${y} `;
        points.push(<circle cx={x} cy={y} key={index} />);
        arrayPath.push({ x, y });
    });

    return (
        <div styleName="wrapper">
            <div styleName="content">
                <span styleName="title">Эквалайзер и Эффекты</span>
                <div styleName="options">
                    <strong>{currentName}</strong>
                    <span>
                        Auto:
                        <strong>{auto ? ' ON' : ' OFF'}</strong>
                    </span>
                </div>
                <div styleName="eq">
                    <svg
                        preserveAspectRatio="none"
                        width={WIDTH - WIDTH / values.length}
                        height={HEIGHT}
                        viewBox={`0 0 ${WIDTH - WIDTH / values.length} ${HEIGHT}`}
                        styleName="chart"
                    >
                        <polyline fill="none" strokeWidth="3px" points={linePath} />
                    </svg>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = state => {
    const currentPreset = getPresetsPresets(state)[getPresetsCurrent(state)];
    const currentName = currentPreset ? currentPreset.name : 'custom';

    return {
        auto: getPresetsAuto(state),
        values: getEqualizerFilters(state),
        currentName,
    };
};

export default connect(
    mapStateToProps,
    null,
)(CSSModules(Component, styles, { allowMultiple: true }));
