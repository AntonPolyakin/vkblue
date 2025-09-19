import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import ClassNames from 'classnames';
import styles from './styles.scss';

import Points from './Points';
import Line from './Line';
import Axis from '../Axis/component';

import { MAX_BIQUAD_FILTER_VALUE, MIN_BIQUAD_FILTER_VALUE, biquadFilterConfigs } from '../../../../modules/equalizer';

class SVGEqualizer extends PureComponent {
    static defaultProps = {
        bigPointSize: 6,
        smallPointSize: 3,
        editable: true,
        width: 300,
        height: 100,
        padding: 10,
        onChange: Function.prototype,
        values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    constructor(props) {
        super(props);

        const { values } = props;
        const points = this.getPoints(values);

        this.state = {
            points,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.getValues = this.getValues.bind(this);
        this.getPoints = this.getPoints.bind(this);
        this.getTooltip = this.getTooltip.bind(this);
    }

    get fullWidth() {
        const { values, width, height, padding } = this.props;

        return width + padding * 2;
    }

    get fullHeight() {
        const { values, width, height, padding } = this.props;

        return height + padding * 2;
    }

    get centerY() {
        const { values, width, height, padding } = this.props;

        return height / 2 + padding;
    }

    get points() {
        const {
            height,
            values,
            values: { length },
            padding,
        } = this.props;
        const { centerY } = this;
        const points = [];

        for (let index = 0; index < length; index++) {
            let y = centerY - (height / 2) * values[index];

            y < padding && (y = padding);
            y > height + padding && (y = height + padding);

            points.push(y);
        }

        return points;
    }

    getValues(points) {
        const { height } = this.props;
        const { centerY } = this;

        const { length } = points;
        const values = [];

        for (let index = 0; index < length; index++) {
            const y = points[index];

            values.push((centerY - y) / (height / 2));
        }

        return values;
    }

    getPoints(values) {
        const { height, padding } = this.props;
        const { centerY } = this;
        const { length } = values;
        const points = [];

        for (let index = 0; index < length; index++) {
            let y = centerY - (height / 2) * values[index];

            y < padding && (y = padding);
            y > height + padding && (y = height + padding);

            points.push(y);
        }

        return points;
    }

    handleChange(points) {
        const values = this.getValues(points);

        this.props.onChange(values);
    }

    handleClick({ pageX, pageY, target }) {
        const {
            getValues,
            fullWidth,
            fullHeight,
            centerY,
            points,
            points: { length },
            handleClick,
        } = this;
        const { width, height, padding, bigPointSize, onChange } = this.props;
        const rect = target.getBoundingClientRect();

        const xPx = pageX - rect.left;
        const yPx = pageY - rect.top;

        const x = (fullWidth / rect.width) * xPx;
        const y = (fullHeight / rect.height) * yPx;

        const step = width / (length - 1);

        for (let index = 0; index < length; index++) {
            const min = padding + step * index - step / 2;
            const max = padding + step * index + step / 2;

            const moreMin = x > min;
            const lessMax = x < max;

            if (moreMin && lessMax) {
                const newPoints = points.slice();
                newPoints[index] = y;

                const values = getValues(newPoints);

                onChange(values);
            }
        }
    }

    getTooltip(index) {
        const { values } = this.props;
        const value = Math.round(
            values[index] >= 0 ? MAX_BIQUAD_FILTER_VALUE * values[index] : MIN_BIQUAD_FILTER_VALUE * values[index],
        );
        const frequency =
            biquadFilterConfigs[index].frequency >= 1000
                ? `${biquadFilterConfigs[index].frequency / 1000}k`
                : biquadFilterConfigs[index].frequency;

        return `${frequency}Hz:${value}dB`;
    }

    render() {
        const { width, height, padding, bigPointSize, smallPointSize, lineWidth, editable } = this.props;
        const { handleChange, fullWidth, fullHeight, centerY, points, handleClick, getTooltip } = this;
        const step = width / (points.length - 1);

        return (
            <div styleName={ClassNames('wrapper', { disabled: !editable })}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={fullWidth}
                    height={fullHeight}
                    viewBox={`0 0 ${fullWidth} ${fullHeight}`}
                >
                    <g onMouseDown={handleClick}>
                        <rect fill="#000" fillOpacity="0" width={fullWidth} height={fullHeight} />
                        <Axis axis="x" padding={padding} width={width} height={height} count={1} />
                        <Axis axis="y" padding={padding} width={width} height={height} count={points.length} />
                        <Line
                            points={points}
                            step={step}
                            padding={padding}
                            width={width}
                            lineWidth={lineWidth}
                            centerY={centerY}
                        />
                        <Points
                            points={points}
                            getTooltip={getTooltip}
                            onChange={handleChange}
                            step={step}
                            padding={padding}
                            bigPointSize={bigPointSize}
                            smallPointSize={smallPointSize}
                        />
                    </g>
                </svg>
            </div>
        );
    }
}

export default CSSModules(SVGEqualizer, styles, { allowMultiple: true });
