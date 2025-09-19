import React from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import PictureBox from './PictureBox/component';
import FileInfo from './FileInfo/component';
import Bio from './Bio/component';
import getArtistPicture from '../../../selectors/getArtistPicture';
import getAlbumPicture from '../../../selectors/getAlbumPicture';
import getTrackAlbum from '../../../selectors/getTrackAlbum';
import getBio from '../../../selectors/getBio';
import getBitrate from '../../../selectors/getBitrate';
import getBioLink from '../../../selectors/getBioLink';
import getFileSize from '../../../selectors/getFileSize';
import getArtistName from '../../../selectors/getArtistName';
import getTrackUrl from '../../../selectors/getTrackUrl';
import getTrackFullName from '../../../selectors/getTrackFullName';
import getGenres from '../../../selectors/getGenres';
// import downloadFile from '../../../actions/downloadFile';
import searchAlbum from '../../../actions/searchAlbum';

const Component = function({
    artistPicture,
    albumPicture,
    genres,
    bitrate,
    filesize,
    artistName,
    artistBio,
    trackAlbum,
    artistBioLink,
    name,
    // url,
    // downloadFile,
    searchAlbum,
}) {
    return (
        <div styleName="wrapper">
            <div styleName="main">
                <PictureBox key={artistPicture} {...{ artistPicture, albumPicture }} />
                <FileInfo
                    size={filesize}
                    {...{
                        bitrate,
                        artistName,
                        name,
                        // url,
                        // onDownloadFile: downloadFile
                    }}
                />
            </div>
            <div styleName="aside">
                <Bio
                    bio={artistBio}
                    name={artistName}
                    album={trackAlbum}
                    link={artistBioLink}
                    onSearchAlbum={searchAlbum}
                    genres={genres}
                />
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    artistPicture: getArtistPicture(state),
    albumPicture: getAlbumPicture(state),
    bitrate: getBitrate(state),
    filesize: getFileSize(state),
    artistName: getArtistName(state),
    artistBio: getBio(state),
    artistBioLink: getBioLink(state),
    trackAlbum: getTrackAlbum(state),
    // url: getTrackUrl(state),
    name: getTrackFullName(state),
    genres: getGenres(state),
});

const mapDispatchToProps = {
    // downloadFile,
    searchAlbum,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CSSModules(Component, styles));
