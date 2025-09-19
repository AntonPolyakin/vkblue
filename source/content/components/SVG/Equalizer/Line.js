import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import ClassNames from 'classnames';
import styles from './styles.scss';

class Line extends PureComponent {
    static defaultProps = {
        points: [],
        lineWidth: 2,
    };

    constructor(props) {
        super(props);
    }

    render() {
        const {
            points,
            points: { length },
            step,
            padding,
            centerY,
            width,
            lineWidth,
        } = this.props;

        const formattedPoints = [];

        for (let index = 0; index < length; index++) {
            const y = points[index];

            formattedPoints.push([padding + step * index, y]);
        }

        const dBackground = toPath([[padding, centerY], ...formattedPoints, [width + padding, centerY]]);
        const dLine = toPath(formattedPoints);

        return (
            <g>
                <pattern id="diagonalHatch" width="3" height="3" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="2" x2="3" y2="2" stroke="#e1e8ee" strokeOpacity="0.5" strokeWidth="1" />
                </pattern>
                <path d={dBackground} fill="url(#diagonalHatch)" stroke="none" />
                <path d={dLine} fill="none" stroke="#577ca1" strokeWidth={lineWidth} />
            </g>
        );
    }
}

export default CSSModules(Line, styles, { allowMultiple: true });

function toPoints(points, tolerance, highestQuality) {
    let mappedToObjXY = mapPointsArray2ObjectXY(points);

    return catmullRom2bezier(mappedToObjXY);
}

function toPath(points, tolerance, highestQuality) {
    let cubics = toPoints(points);
    let attribute = `M${points[0][0]}, ${points[0][1]}`;
    for (let i = 0; i < cubics.length; i++) {
        attribute += `C${cubics[i][0]},${cubics[i][1]} ${cubics[i][2]},${cubics[i][3]} ${cubics[i][4]},${cubics[i][5]}`;
    }
    return attribute;
}

function catmullRom2bezier(pts) {
    let cubics = [];
    for (let i = 0, iLen = pts.length; i < iLen; i++) {
        let p = [pts[i - 1], pts[i], pts[i + 1], pts[i + 2]];
        if (i === 0) {
            p[0] = {
                x: pts[0].x,
                y: pts[0].y,
            };
        }
        if (i === iLen - 2) {
            p[3] = {
                x: pts[iLen - 2].x,
                y: pts[iLen - 2].y,
            };
        }
        if (i === iLen - 1) {
            p[2] = {
                x: pts[iLen - 1].x,
                y: pts[iLen - 1].y,
            };
            p[3] = {
                x: pts[iLen - 1].x,
                y: pts[iLen - 1].y,
            };
        }
        let val = 6;
        cubics.push([
            (-p[0].x + val * p[1].x + p[2].x) / val,
            (-p[0].y + val * p[1].y + p[2].y) / val,
            (p[1].x + val * p[2].x - p[3].x) / val,
            (p[1].y + val * p[2].y - p[3].y) / val,
            p[2].x,
            p[2].y,
        ]);
    }
    return cubics;
}

function mapPointsArray2ObjectXY(points) {
    return points.map(function(point) {
        return {
            x: point[0],
            y: point[1],
        };
    });
}

function mapPointsObjectXY2Array(points) {
    return points.map(function(point) {
        return [point.x, point.y];
    });
}
