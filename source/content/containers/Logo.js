import React from 'react';
import { connect } from 'react-redux';

import Logo from '../components/Logo/component';
import openLightBox from '../actions/openLightBox';
import { updatePlayerDisplay } from '../../actionCreators/view';

function mapDispatchToProps(dispatch) {
    return {
        onOpenConfig() {
            dispatch(openLightBox('config'));
        },
        onHidePlayerView() {
            dispatch(updatePlayerDisplay(false));
            alert('Панель будет спрятана.\nЧтобы вернуть панель нажмите на иконку vkBlue.\n(возле громкости)');
        },
    };
}

export default connect(
    null,
    mapDispatchToProps,
)(Logo);
