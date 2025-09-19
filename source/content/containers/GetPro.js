import React from 'react';
import { connect } from 'react-redux';

import GetPro from '../components/GetPro/component';
import closeLightBox from '../actions/closeLightBox';

function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {
        onClose() {
            dispatch(closeLightBox());
        },
        onShare() {
            dispatch(closeLightBox());
        },
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(GetPro);
