import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import ClassNames from 'classnames';
import styles from './styles.scss';

class Axis extends PureComponent {
    static defaultProps = {
        axis: 'y',
        width: 100,
        height: 100,
        padding: 10,
        count: 1,
        mainColor: '#e7e8ec',
        secondColor: 'white',
    };

    constructor(props) {
        super(props);

        this.getGradient = this.getGradient.bind(this);
        this.getLines = this.getLines.bind(this);
    }

    getGradient() {
        const {
            props: { axis, mainColor, secondColor, width, height, padding },
        } = this;
        let x2,
            y2 = null;

        if (axis === 'y') {
            x2 = 0;
            y2 = 100;
        } else {
            x2 = 100;
            y2 = 0;
        }

        return (
            <defs>
                <linearGradient
                    id={`${width}_${height}_${padding}_axisGradient`}
                    x1="0%"
                    x2={`${x2}%`}
                    y1="0%"
                    y2={`${y2}%`}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor={secondColor} />
                    <stop offset="50%" stopColor={mainColor} />
                    <stop offset="100%" stopColor={secondColor} />
                </linearGradient>
            </defs>
        );
    }

    getLines() {
        const {
            props: { axis, count, width, height, padding },
        } = this;
        const lines = [];

        for (let index = 0; index < count; index++) {
            let x1,
                x2,
                y1,
                y2 = null;

            if (axis === 'y') {
                const step = width / (count - 1);

                x1 = x2 = count > 1 ? padding + step * index : padding + width / 2;
                y1 = padding;
                y2 = padding + height;
            } else {
                const step = height / (count - 1);

                y1 = y2 = count > 1 ? padding + step * index : padding + height / 2;
                x1 = padding;
                x2 = padding + width;
            }

            lines.push(
                <line
                    key={index}
                    x1={x1}
                    x2={x2}
                    y1={y1}
                    y2={y2}
                    stroke={`url(#${width}_${height}_${padding}_axisGradient)`}
                    strokeWidth="1"
                />,
            );
        }

        return lines;
    }

    render() {
        const { getGradient, getLines } = this;

        return (
            <g>
                {getGradient()}
                {getLines()}
            </g>
        );
    }
}

export default CSSModules(Axis, styles, { allowMultiple: true });
