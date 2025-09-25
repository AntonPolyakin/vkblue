import React, { Component } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import ClassNames from 'classnames';
import styles from './styles.scss';
import { getSettingsScrobblerEnabled } from '../../../store/settings/selectors';
import {
    getScrobblerAuth,
    getScrobblerEnabled,
    getScrobblerProcessing,
    getScrobblerSuccess,
} from '../../../store/scrobbler/selectors';
import { switchScrobbler } from '../../../actionCreators/scrobbler';

class LastFM extends Component {
    static defaultProps = {};

    constructor(props) {
        super(props);

        this.onClickLastFM = this.onClickLastFM.bind(this);
    }

    onClickLastFM() {
        const { scrobbler, switchScrobbler, auth } = this.props;

        !auth && switchScrobbler(!scrobbler);
    }

    render() {
        const { scrobbler, processing, success, auth, visibility } = this.props;

        if (visibility === false) {
            return null;
        }

        const lastFMClassnames = ClassNames('enabled', { loading: processing, done: success });

        const disabledView = (
            <a styleName="disabled" onClick={this.onClickLastFM}>
            </a>
        );
        const enabledView = (
            <a styleName={lastFMClassnames} onClick={this.onClickLastFM}>
                <span styleName="default">Активен</span>
                <span styleName="hover">Отключить</span>
            </a>
        );
        const loadingView = <div styleName="loading"></div>;

        return <div styleName="buttons">{auth ? loadingView : scrobbler ? enabledView : disabledView}</div>;
    }
}

const mapStateToProps = state => ({
    scrobbler: getScrobblerEnabled(state),
    processing: getScrobblerProcessing(state),
    success: getScrobblerSuccess(state),
    auth: getScrobblerAuth(state),
    visibility: getSettingsScrobblerEnabled(state),
});

const mapDispatchToProps = {
    switchScrobbler,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CSSModules(LastFM, styles, { allowMultiple: true }));
