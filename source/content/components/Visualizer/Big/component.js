import React from 'react';
import { connect } from 'react-redux';

import Canvas from './Canvas';
import Image from './Image';
import { getSettingsAnalyzerEnabled } from '../../../../store/settings/selectors';
import { getAudioPaused } from '../../../../store/audio/selectors';

const Visualizer = ({ isActive, paused }) => {
    if (isActive) {
        return <Canvas />;
    } else {
        return <Image paused={paused} />;
    }
};

const mapStateToProps = state => ({
    isActive: getSettingsAnalyzerEnabled(state),
    paused: getAudioPaused(state),
});

export default connect(
    mapStateToProps,
    null,
)(Visualizer);
