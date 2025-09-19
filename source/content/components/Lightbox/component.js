import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

import AddPreset from '../../components/AddPreset/component';
import About from '../../components/About/component';
import { Settings } from '../../../components/Config/component';
import Help from '../../components/Help/component';
import GetPro from '../../containers/GetPro';
import { connect } from 'react-redux';
import getLightBoxName from '../../selectors/getLightBoxName';

const Templates = {
    add_preset: AddPreset,
    pro: GetPro,
    about: About,
    config: Settings,
    help: Help,
};

class Lightbox extends PureComponent {
    render() {
        const { name } = this.props;

        if (!name || !Templates[name]) {
            return null;
        }

        const Template = Templates[name];

        return (
            <div styleName="lightbox_wrapper">
                <div styleName="lightbox">
                    <Template />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    name: getLightBoxName(state),
});

export default connect(
    mapStateToProps,
    null,
)(CSSModules(Lightbox, styles, { allowMultiple: true }));
