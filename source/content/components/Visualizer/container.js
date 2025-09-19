import React from 'react';
import { connect } from 'react-redux';

import BigVisualizer from './Big/component';
import SmallVisualizer from './Small/component';

import getActiveBlock from '../../selectors/getActiveBlock';
import Empty from '../../components/Empty/component';
import { getSettingsAnalyzerEnabled } from '../../../store/settings/selectors';

const Visualizer = ({ activeBlockName, isDisabled }) => {
    if (activeBlockName === 'visualizer') {
        if (isDisabled) {
            return <Empty text="Визуалайзер отключен" />;
        } else {
            return <BigVisualizer />;
        }
    } else {
        return <SmallVisualizer />;
    }
};

const mapStateToProps = state => ({
    activeBlockName: getActiveBlock(state),
    isDisabled: !getSettingsAnalyzerEnabled(state),
});

export default connect(
    mapStateToProps,
    null,
)(Visualizer);
