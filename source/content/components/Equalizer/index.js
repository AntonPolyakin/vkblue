import React from 'react';
import { connect } from 'react-redux';

import Big from './Big';
import Small from './Small/index';

import getActiveBlock from '../../selectors/getActiveBlock';

const Equalizer = ({ activeBlockName }) => {
    if (activeBlockName === 'equalizer') {
        return <Big />;
    } else {
        return <Small />;
    }
};

const mapStateToProps = state => ({
    activeBlockName: getActiveBlock(state),
});

export default connect(
    mapStateToProps,
    null,
)(Equalizer);
