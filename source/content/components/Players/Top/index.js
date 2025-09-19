import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import CSSModules from 'react-css-modules';
import styles from '../styles.scss';
import info from '../../Info/index';
import visualizer from '../../Visualizer/container';
import lyrics from '../../Lyrics/index';
import equalizer from '../../Equalizer/index';
import Logo from '../../../containers/Logo';
import getBase from '../../../selectors/getBase';
import getDisplay from '../../../selectors/getDisplay';
import getOrder from '../../../selectors/getOrder';
import swapBlocks from '../../../actions/swapBlocks';
import { getSettingsAnalyzerEnabled } from '../../../../store/settings/selectors';

const components = { info, visualizer, equalizer, lyrics };

class TopPlayer extends Component {
    static defaultProps = {};

    onChangeOrder(name) {
        const { order, swapBlocks } = this.props;

        if (order[0] !== name) {
            swapBlocks(name);
        }
    }
    componentDidUpdate() {
        const { isDisabled } = this.props;
        if (isDisabled) {
            delete window.document.body.dataset.blueHp;
        } else {
            window.document.body.dataset.blueHp = true;
        }
    }
    componentDidMount() {
        const { isDisabled } = this.props;
        if (!isDisabled) {
            window.document.body.dataset.blueHp = true;
        }
    }
    componentWillUnmount() {
        delete window.document.body.dataset.blueHp;
    }

    render() {
        const { onChangeOrder } = this;
        const { isDisabled, isNotReady, order, styles } = this.props;

        if (isDisabled) {
            return null;
        }

        if (isNotReady) {
            return <Logo />;
        }

        const active = order[0];
        const inactive = order.slice(1);

        const Active = components[active];

        return (
            <div styleName="content top-content">
                <div styleName="player-wrap top-player-wrap">
                    <main styleName="main">
                        <div key={active} styleName="main-container">
                            <Active />
                        </div>
                    </main>
                    <aside styleName="aside">
                        <div className={styles.animated}>
                            {inactive.map(name => {
                                const Inactive = components[name];
                                const classes = classNames('component', {
                                    big: inactive.length === 2,
                                });

                                return (
                                    <div key={name} styleName={classes} onClick={onChangeOrder.bind(this, name)}>
                                        <div styleName="container">
                                            <Inactive />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </aside>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const order = [...getOrder(state)];
    const visualizerIsDisabled = !getSettingsAnalyzerEnabled(state);

    if (visualizerIsDisabled) {
        order.pop();
    }

    return {
        order: order,
        isDisabled: !getDisplay(state),
        isNotReady: !getBase(state),
        visualizerIsDisabled,
    };
}

const mapDispatchToProps = {
    swapBlocks,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CSSModules(TopPlayer, styles, { allowMultiple: true }));
