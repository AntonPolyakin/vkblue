import React, { Component } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import ClassNames from 'classnames';
import styles from './styles.scss';
import getDisplay from '../../selectors/getDisplay';
import { updatePlayerDisplay } from '../../../actionCreators/view';

class PanelButtons extends Component {
    static defaultProps = {};

    constructor(props) {
        super(props);

        this.onClickBlue = this.onClickBlue.bind(this);
    }

    onClickBlue() {
        const { display, viewChangeDisplay } = this.props;

        viewChangeDisplay(!display);
    }

    render() {
        const { display } = this.props;
        const blueClassnames = ClassNames('blue', { enabled: display });

        return (
            <div styleName="buttons">
                <div styleName={blueClassnames} onClick={this.onClickBlue} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    display: getDisplay(state),
});

const mapDispatchToProps = {
    viewChangeDisplay: updatePlayerDisplay,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CSSModules(PanelButtons, styles, { allowMultiple: true }));
