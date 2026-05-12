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

        const lastFMClassnames = ClassNames('enabled', { processing: processing, done: success });

        const disabledView = (
            <svg styleName="disabled" onClick={this.onClickLastFM} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.584 17.21l-.88-2.392s-1.43 1.594-3.573 1.594c-1.897 0-3.244-1.649-3.244-4.288 0-3.382 1.704-4.591 3.381-4.591 2.42 0 3.189 1.567 3.849 3.574l.88 2.749c.88 2.666 2.529 4.81 7.285 4.81 3.409 0 5.718-1.044 5.718-3.793 0-2.227-1.265-3.381-3.63-3.931l-1.758-.385c-1.21-.275-1.567-.77-1.567-1.595 0-.934.742-1.484 1.952-1.484 1.32 0 2.034.495 2.144 1.677l2.749-.33c-.22-2.474-1.924-3.492-4.729-3.492-2.474 0-4.893.935-4.893 3.932 0 1.87.907 3.051 3.189 3.601l1.87.44c1.402.33 1.869.907 1.869 1.704 0 1.017-.99 1.43-2.86 1.43-2.776 0-3.93-1.457-4.59-3.464l-.907-2.75c-1.155-3.573-2.997-4.893-6.653-4.893C2.144 5.333 0 7.89 0 12.233c0 4.18 2.144 6.434 5.993 6.434 3.106 0 4.591-1.457 4.591-1.457z" />
            </svg>
        );
        const enabledView = (

            <svg styleName={lastFMClassnames} onClick={this.onClickLastFM} xmlns="http://www.w3.org/2000/svg" class="processing" viewBox="0 0 24 24" fill="currentColor">
                <defs>
                    <linearGradient id="snakeGradient">
                        <stop offset="0%" stop-color="transparent" />
                        <stop offset="35%" stop-color="white" />
                        <stop offset="65%" stop-color="white" />
                        <stop offset="100%" stop-color="transparent" />

                        <animateTransform attributeName="gradientTransform" type="translate" from="-1 0" to="1 0" dur="1s" repeatCount="indefinite" />
                    </linearGradient>

                    <mask id="snakeMask">
                        <rect x="-24" y="0" width="48" height="24" fill="url(#snakeGradient)" />
                    </mask>
                </defs>

                <path
                    xmlns="http://www.w3.org/2000/svg"
                    d="M10.584 17.21l-.88-2.392s-1.43 1.594-3.573 1.594c-1.897 0-3.244-1.649-3.244-4.288 0-3.382 1.704-4.591 3.381-4.591 2.42 0 3.189 1.567 3.849 3.574l.88 2.749c.88 2.666 2.529 4.81 7.285 4.81 3.409 0 5.718-1.044 5.718-3.793 0-2.227-1.265-3.381-3.63-3.931l-1.758-.385c-1.21-.275-1.567-.77-1.567-1.595 0-.934.742-1.484 1.952-1.484 1.32 0 2.034.495 2.144 1.677l2.749-.33c-.22-2.474-1.924-3.492-4.729-3.492-2.474 0-4.893.935-4.893 3.932 0 1.87.907 3.051 3.189 3.601l1.87.44c1.402.33 1.869.907 1.869 1.704 0 1.017-.99 1.43-2.86 1.43-2.776 0-3.93-1.457-4.59-3.464l-.907-2.75c-1.155-3.573-2.997-4.893-6.653-4.893C2.144 5.333 0 7.89 0 12.233c0 4.18 2.144 6.434 5.993 6.434 3.106 0 4.591-1.457 4.591-1.457z"
                    mask={processing ? 'url(#snakeMask)' : undefined}
                />
            </svg>

        );
        const loadingView = (
            <svg styleName="loading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <g>
                    <rect x="11" y="1" width="2" height="5" opacity=".14" />
                    <rect x="11" y="1" width="2" height="5" transform="rotate(30 12 12)" opacity=".29" />
                    <rect x="11" y="1" width="2" height="5" transform="rotate(60 12 12)" opacity=".43" />
                    <rect x="11" y="1" width="2" height="5" transform="rotate(90 12 12)" opacity=".57" />
                    <rect x="11" y="1" width="2" height="5" transform="rotate(120 12 12)" opacity=".71" />
                    <rect x="11" y="1" width="2" height="5" transform="rotate(150 12 12)" opacity=".86" />
                    <rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)" />
                    <animateTransform attributeName="transform" type="rotate" calcMode="discrete" dur="0.75s" values="0 12 12;30 12 12;60 12 12;90 12 12;120 12 12;150 12 12;180 12 12;210 12 12;240 12 12;270 12 12;300 12 12;330 12 12;360 12 12" repeatCount="indefinite" />
                </g>
            </svg>
        );

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
