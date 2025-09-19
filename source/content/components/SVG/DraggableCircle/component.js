import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import ClassNames from 'classnames';
import styles from './styles.scss';

class DraggableCircle extends PureComponent {
    static defaultProps = {
        cy: 0,
        cx: 0,
        bigPointSize: 6,
        smallPointSize: 3,
        tooltip: 'tooltip',
        name: 'name',
        mainColor: '#577ca1',
        secondColor: '#e7e8ec',
        onChange: Function.prototype,
    };

    constructor(props) {
        super(props);

        this.state = { dragged: false };

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    handleMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();

        this.clientY = event.clientY;
        this.clientX = event.clientX;

        this.setState(() => ({ dragged: true }));

        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);

        return false;
    }

    handleMouseMove({ clientY, clientX }) {
        const { onChange, name, cy, cx } = this.props;
        const diffY = clientY - this.clientY;
        const diffX = clientX - this.clientX;

        this.clientY = clientY;
        this.clientX = clientX;

        onChange({ name, cy: cy + diffY, cx: cx + diffX });
    }

    handleMouseUp() {
        this.setState(prevState => ({ dragged: false }));

        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
    }

    componentWillUnmount() {
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
    }

    render() {
        const {
            props: { cx, cy, mainColor, secondColor, smallPointSize, bigPointSize, tooltip },
            state: { dragged },
            handleMouseDown,
        } = this;
        const doubleSize = bigPointSize * 2;
        const transform = `translate(0, ${cy > doubleSize * 1.5 ? -doubleSize : doubleSize * 1.5})`;

        return (
            <g onMouseDown={handleMouseDown} styleName={ClassNames('wrapper', { dragged })}>
                <circle cx={cx} cy={cy} r={bigPointSize} fill={mainColor} styleName="circle-big" />
                <circle cx={cx} cy={cy} r={smallPointSize} fill={secondColor} styleName="circle-small" />
                <text
                    filter="url(#point-tooltip)"
                    styleName="tooltip"
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    transform={transform}
                >
                    {tooltip}
                </text>
                <text styleName="tooltip" x={cx} y={cy} textAnchor="middle" transform={transform}>
                    {tooltip}
                </text>
            </g>
        );
    }
}

export default CSSModules(DraggableCircle, styles, { allowMultiple: true });
