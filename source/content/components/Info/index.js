import React from 'react';
import { connect } from 'react-redux';

import Loader from '../Loader/component';
import BigInfo from './Big/component';
import SmallInfo from './Small/component';
import getActiveBlock from '../../selectors/getActiveBlock';
import getLastFMLoading from '../../selectors/getLastFMLoading';

const Info = ({ activeBlockName, loading }) => {
    if (loading) {
        return <Loader />;
    }

    if (activeBlockName === 'info') {
        return <BigInfo />;
    } else {
        return <SmallInfo />;
    }
};

function mapStateToProps(state) {
    return {
        activeBlockName: getActiveBlock(state),
        loading: getLastFMLoading(state),
    };
}

export default connect(
    mapStateToProps,
    null,
)(Info);
