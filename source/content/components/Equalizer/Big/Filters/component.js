import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

import Equalizer from '../../../SVG/Equalizer/component';
import { connect } from 'react-redux';
import { getEqualizerFilters } from '../../../../../store/equalizer/selectors';
import { updateBiquadFilters } from '../../../../../actionCreators/equalizer';

class Filters extends PureComponent {
    render() {
        const { filters, equalizerUpdateFilters } = this.props;
        return <Equalizer values={filters} width={340} height={120} padding={10} onChange={equalizerUpdateFilters} />;
    }
}

const mapStateToProps = state => ({
    filters: getEqualizerFilters(state),
});

const mapDispatchToProps = {
    equalizerUpdateFilters: updateBiquadFilters,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CSSModules(Filters, styles, { allowMultiple: true }));
