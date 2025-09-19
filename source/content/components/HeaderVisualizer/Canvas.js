import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

const CANVAS_WIDTH = 40;
const CANVAS_HEIGHT = 28;
const COUNT = 4;
const MARGIN = 4;
const WIDTH = CANVAS_WIDTH / COUNT;

class Canvas extends Component {
    constructor(props) {
        super(props);

        this.prevValues = [];
        this.redrawCanvas = this.redrawCanvas.bind(this);
    }

    redrawCanvas(frequencies) {
        const context = this.canvasContext;
        const values = frequencies
            ? [
                  Math.max.apply(null, Array.prototype.slice.call(frequencies, 0, 3)),
                  Math.max.apply(null, Array.prototype.slice.call(frequencies, 3, 8)),
                  Math.max.apply(null, Array.prototype.slice.call(frequencies, 9, 12)),
                  Math.max.apply(null, Array.prototype.slice.call(frequencies, 12, 30)),
              ]
            : [0.3, 0.9, 0.5, 0.1];

        for (let i = 0; i < COUNT; i++) {
            let value = -(values[i] * CANVAS_HEIGHT);
            let prevValue = -(this.prevValues[i] * CANVAS_HEIGHT);

            let x = i * WIDTH;
            let y = CANVAS_HEIGHT;
            let w = WIDTH - MARGIN;
            let h = value > -4 ? -4 : value;

            if (typeof prevValue === 'number') {
                if (value > prevValue) {
                    const diff = prevValue - value;

                    context.clearRect(x - 1, y + h - 1, x + w + 1, diff);
                }
            } else {
                context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }

            context.beginPath();
            context.moveTo(x, y);
            context.arcTo(x + w, y, x + w, y + h, 0);
            context.arcTo(x + w, y + h, x, y + h, 0);
            context.arcTo(x, y + h, x, y, 0);
            context.arcTo(x, y, x + w, y, 0);
            context.closePath();

            context.fill();
        }

        this.prevValues = values;
    }

    componentDidMount() {
        this.canvas = this.refs.canvas;

        this.canvasContext = this.canvas.getContext('2d');
        this.canvasContext.fillStyle = '#d7e2ec';
        window.analyserListeners.push(this.redrawCanvas);

        this.redrawCanvas();
    }

    componentWillUnmount() {
        const analyserCallbackIndex = window.analyserListeners.indexOf(this.redrawCanvas);
        if (analyserCallbackIndex >= 0) {
            window.analyserListeners.splice(analyserCallbackIndex, 1);
        }
    }

    render() {
        return <canvas styleName="canvas" ref="canvas" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
    }
}

export default CSSModules(Canvas, styles);
