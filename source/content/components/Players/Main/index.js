import React, { Component } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';

import swapBlocks from '../../../actions/swapBlocks';
import styles from '../styles.scss';
import info from '../../Info/index';
import visualizer from '../../Visualizer/container';
import lyrics from '../../Lyrics/index';
import equalizer from '../../Equalizer/index';
import Logo from '../../../containers/Logo';
import Links from '../../../containers/Links';
import getOrder from '../../../selectors/getOrder';
import getDisplay from '../../../selectors/getDisplay';
import getBase from '../../../selectors/getBase';
import classNames from 'classnames';
import { getSettingsAnalyzerEnabled } from '../../../../store/settings/selectors';

const components = { info, visualizer, equalizer, lyrics };

class MainPlayer extends Component {
    static defaultProps = {};

    constructor(props) {
        super(props);

        this.state = { height: 0 };

        this.onScroll = this.onScroll.bind(this);
    }

    onChangeOrder(name) {
        const { order, swapBlocks } = this.props;

        if (order[0] !== name) {
            swapBlocks(name);
        }
    }

    onScroll() {
        const content = document.querySelector('#content');
        if (!content) return;

        if (window.scrollY > 50) {
            content.style.paddingBottom = '200px';
        } else if (window.scrollY < 50) {
            content.style.paddingBottom = '0px';
        }
    }
    componentDidUpdate() {
        const { isDisabled } = this.props;
        if (isDisabled) {
            delete window.document.body.dataset.blueMp;
        } else {
            window.document.body.dataset.blueMp = true;
        }
    }

    componentDidMount() {
        const { isDisabled } = this.props;
        if (!isDisabled) {
            window.document.body.dataset.blueMp = true;
        }

        window.addEventListener('scroll', this.onScroll);
    }

    componentWillUnmount() {
        delete window.document.body.dataset.blueMp;
        window.removeEventListener('scroll', this.onScroll);
    }

    render() {
        const { onChangeOrder } = this;
        const { isDisabled, isNotReady, order, styles, visualizerIsDisabled } = this.props;

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
            <div styleName="content">
                <div styleName="player-wrap">
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
                <Links />
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
)(CSSModules(MainPlayer, styles, { allowMultiple: true }));
