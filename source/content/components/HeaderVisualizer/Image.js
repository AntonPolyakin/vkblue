import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

const Image = ({ paused }) => <div styleName={paused ? 'image-pause' : 'image-play'} />;

export default CSSModules(Image, styles);
