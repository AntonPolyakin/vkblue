import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

const Image = ({ paused }) => (
    <div styleName="image">
        <svg
            style={{ height: paused ? '20px' : '50%' }}
            viewBox="0 0 300 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g styleName="curve" stroke="#507299" fill="none" fillRule="evenodd">
                <path d="M0 50 C200 0, 100 0, 300 50 C100 100, 200 100, 0 50" fill="#507299" opacity={0.25} />
                <path d="M0 50 C300 30, 250 20, 300 50 C250 80, 300 70, 0 50" fill="#507299" opacity={0.25} />
                <path d="M0 50 C50 30, 0 20, 300 50 C0 80, 50 70, 0 50" fill="#507299" opacity={0.25} />
                <path d="M0 50 C100 10, 200 10, 300 50 C200 90, 100 90, 0 50" fill="#507299" opacity={0.25} />
                <circle r="1" cx="1" cy="50" fill="#507299" opacity={0.5} />
                <circle r="1" cx="299" cy="50" fill="#507299" opacity={0.5} />
            </g>
        </svg>
    </div>
);

export default CSSModules(Image, styles);
