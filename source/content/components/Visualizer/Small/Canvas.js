import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import ClassNames from 'classnames';
import styles from './styles.scss';

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 60;
const COUNT = 30;

const MARGIN = Math.round(CANVAS_WIDTH / 100);

class Visualizer extends Component {
    constructor(props) {
        super(props);

        this.redrawCanvas = this.redrawCanvas.bind(this);
    }

    redrawCanvas(freqData) {
        const ctx = this.ctx;

        const values = [];

        for (let index = 0; index < COUNT; index++) {
            values[index] = freqData[index];
        }

        const prevValues = this.prevValues || [];

        // ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        //ctx.fillStyle = 'rgba(87, 124, 161, 0.8)';

        const width = CANVAS_WIDTH / values.length;

        for (let i = 0; i < values.length; i++) {
            let value = -(values[i] * CANVAS_HEIGHT);
            let prevValue = -(prevValues[i] * CANVAS_HEIGHT);
            let x = i * width;
            let y = CANVAS_HEIGHT;
            let w = width - MARGIN;
            let h = value > -1 ? -1 : value;
            let r = 0;

            if (typeof prevValue === 'number') {
                if (value > prevValue) {
                    const diff = prevValue - value;

                    ctx.clearRect(x - 1, y + h - 1, x + w + 1, diff);
                }
            } else {
                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }

            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, 0);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, 0);
            ctx.closePath();

            ctx.fill();
        }

        this.prevValues = values;
    }

    onCanvasMount = node => {
        this.canvas = node;
    };

    componentDidMount() {
        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = '#577ca1';

        const initFrequencies = [];
        let count = COUNT;

        while (count--) {
            initFrequencies.push(0);
        }

        this.redrawCanvas(initFrequencies);

        window.analyserListeners.push(this.redrawCanvas);
    }

    componentWillUnmount() {
        window.analyserListeners.splice(window.analyserListeners.indexOf(this.redrawCanvas), 1);
    }

    render() {
        return (
            <div styleName="wrapper">
                <span styleName="title">Визуалайзер</span>
                <canvas styleName="body" ref={this.onCanvasMount} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
            </div>
        );
    }
}

export default CSSModules(Visualizer, styles, { allowMultiple: true });
