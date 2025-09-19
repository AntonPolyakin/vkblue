import React from 'react';
import { connect } from 'react-redux';

import Links from '../components/Links/component';
import openLightBox from '../actions/openLightBox';

function mapDispatchToProps(dispatch) {
    return {
        onOpenInfo() {
            dispatch(openLightBox('about'));
        },
        onOpenConfig() {
            dispatch(openLightBox('config'));
        },
        onOpenHelp() {
            dispatch(openLightBox('help'));
        },
    };
}

export default connect(
    null,
    mapDispatchToProps,
)(Links);
