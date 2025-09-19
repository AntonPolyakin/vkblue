import React from 'react';
import { connect } from 'react-redux';

import Loader from '../Loader/component';
import { BigLyrics } from './Big/component';
import { SmallLyrics } from './Small/component';

import getActiveBlock from '../../selectors/getActiveBlock';
import getArtistName from '../../selectors/getArtistName';
import getTrackTitle from '../../selectors/getTrackTitle';
import { useLyrics } from '../../../modules/Lyrics/hooks';

const Lyrics = ({ activeBlockName, artist, title }) => {
    const lyrics = useLyrics(artist, title);

    if (lyrics === undefined) {
        return <Loader />;
    }

    if (activeBlockName === 'lyrics') {
        return <BigLyrics text={lyrics} />;
    } else {
        return <SmallLyrics text={lyrics} />;
    }
};

const mapStateToProps = state => ({
    activeBlockName: getActiveBlock(state),
    artist: getArtistName(state),
    title: getTrackTitle(state),
});

export default connect(
    mapStateToProps,
    null,
)(Lyrics);
