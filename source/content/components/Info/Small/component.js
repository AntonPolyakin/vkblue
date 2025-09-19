import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import PictureBox from './PictureBox/component';
import FileInfo from './FileInfo/component';
import getArtistPicture from '../../../selectors/getArtistPicture';
import getAlbumPicture from '../../../selectors/getAlbumPicture';
import { connect } from 'react-redux';
import getBitrate from '../../../selectors/getBitrate';
import getFileSize from '../../../selectors/getFileSize';
import getArtistName from '../../../selectors/getArtistName';
// import getTrackUrl from '../../../selectors/getTrackUrl';
import getTrackFullName from '../../../selectors/getTrackFullName';
import { getSettingsAnalyzerEnabled } from '../../../../store/settings/selectors';
// import downloadFile from '../../../actions/downloadFile';

const Component = function({
    artistPicture,
    albumPicture,
    bitrate,
    filesize,
    artistName,
    name,
    extended,
    // url,
    // downloadFile,
}) {
    return (
        <div styleName="wrapper">
            <PictureBox key={artistPicture} {...{ artistPicture, albumPicture, extended }} />
            <FileInfo
                size={filesize}
                {...{
                    bitrate,
                    artistName,
                    name,
                    extended,
                    // url,
                    // onDownloadFile: downloadFile
                }}
            />
        </div>
    );
};

const mapStateToProps = state => ({
    artistPicture: getArtistPicture(state),
    albumPicture: getAlbumPicture(state),
    bitrate: getBitrate(state),
    filesize: getFileSize(state),
    artistName: getArtistName(state),
    // url: getTrackUrl(state),
    name: getTrackFullName(state),
    extended: !getSettingsAnalyzerEnabled(state),
});

const mapDispatchToProps = {
    // downloadFile,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CSSModules(Component, styles));
