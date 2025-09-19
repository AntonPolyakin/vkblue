import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import ClassNames from 'classnames';
import styles from './styles.scss';

import DraggableCircle from '../DraggableCircle/component';

class Points extends PureComponent {
    static defaultProps = {
        bigPointSize: 6,
        smallPointSize: 3,
        points: [],
        onChange: Function.prototype,
        getTooltip: Function.prototype,
    };

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange({ name, cy }) {
        const { points, onChange } = this.props;

        points[name] = cy;
        onChange([...points]);
    }

    render() {
        const { handleChange } = this;
        const {
            step,
            padding,
            points,
            points: { length },
            bigPointSize,
            smallPointSize,
            getTooltip,
        } = this.props;
        const elements = [];

        for (let index = 0; index < length; index++) {
            const y = points[index];

            elements.push(
                <DraggableCircle
                    key={index}
                    name={index}
                    cx={padding + step * index}
                    cy={y}
                    tooltip={getTooltip(index)}
                    bigPointSize={bigPointSize}
                    smallPointSize={smallPointSize}
                    onChange={handleChange}
                />,
            );
        }

        return (
            <g>
                <defs>
                    <filter x="0" y="0" width="1" height="1" id="point-tooltip">
                        <feFlood floodColor="#577ca1" />
                        <feComposite in="SourceGraphic" operator="xor" />
                    </filter>
                </defs>
                {elements}
            </g>
        );
    }
}

export default CSSModules(Points, styles, { allowMultiple: true });
