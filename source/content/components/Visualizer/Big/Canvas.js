import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import ClassNames from 'classnames';
import styles from './styles.scss';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 300;

const COUNT = 32;

const MARGIN = Math.round(CANVAS_WIDTH / 150);
const BORDER_RADIUS = Math.round(CANVAS_HEIGHT / 150);

class Component extends PureComponent {
    constructor(props) {
        super(props);

        this.redrawCanvas = this.redrawCanvas.bind(this);
    }

    redrawCanvas(freqData) {
        const canvas = this.canvas;
        const ctx = this.ctx;

        const values = [];

        for (let index = 0; index < COUNT; index++) {
            values[index] = freqData[index];
        }

        const prevValues = this.prevValues || [];

        const width = CANVAS_WIDTH / values.length;
        let sum = 0;

        for (let i = 0, length = values.length; i < length; i++) {
            let value = values[i];
            let prevValue = prevValues[i];

            sum += value;

            value = value * ((CANVAS_HEIGHT * 0.9) / 2);
            prevValue = prevValue * ((CANVAS_HEIGHT * 0.9) / 2);

            let x = i * width;
            let y = CANVAS_HEIGHT / 2;
            let w = width - MARGIN;
            let h = value;
            let r = BORDER_RADIUS;

            if (value < r) {
                r = 0;
            }

            if (typeof prevValue === 'number') {
                if (value < prevValue) {
                    const diff = prevValue - value;

                    ctx.clearRect(x - 1, y - h - BORDER_RADIUS, x + w + 1, -diff);
                    ctx.clearRect(x - 1, y + h + BORDER_RADIUS, x + w + 1, diff);
                }
            } else {
                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }

            ctx.beginPath();
            ctx.moveTo(x, y + h - r);
            ctx.lineTo(x, y - h + r);
            ctx.arcTo(x, y - h, x + r, y - h, r);
            ctx.lineTo(x + w - r, y - h);
            ctx.arcTo(x + w, y - h, x + w, y - h + r, r);
            ctx.lineTo(x + w, y + h - r);
            ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
            ctx.lineTo(x + r, y + h);
            ctx.arcTo(x, y + h, x, y + h - r, r);
            ctx.closePath();
            ctx.fill();
        }

        this.prevValues = values;

        cancelAnimationFrame(this.animationId);
        this.animationId = requestAnimationFrame(() => {
            if (canvas instanceof HTMLCanvasElement) {
                canvas.style.transform = `scale(${1 + sum / values.length / 3})`;
            }
        });
    }

    onCanvasMount = node => {
        this.canvas = node;
    };

    componentDidMount() {
        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = '#577ca1';
        this.ctx.strokeStyle = '#577ca1';

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
                <canvas styleName="body" ref={this.onCanvasMount} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
            </div>
        );
    }
}

export default CSSModules(Component, styles, { allowMultiple: true });
