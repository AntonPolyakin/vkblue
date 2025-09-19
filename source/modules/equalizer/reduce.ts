export const FFT_SIZE = 8192; //[256, 512, 1024, 2048, 4096, 8192];
const LOG_SCALE = 2.55;
const START = 0;
const END = Math.round((FFT_SIZE / 2) * 0.8);
const MAX_EXPONENT = 5;
const MIN_EXPONENT = 3;
const SIZE = 32;

const generatePoints: (size: number) => Uint32Array = size => {
    const points = new Uint32Array(size);

    let lastSpot = 0;

    for (let index = 0; index < size; index++) {
        let bin = Math.round(Math.pow(index / size, LOG_SCALE) * (END - START) + START);

        if (bin <= lastSpot) {
            bin = lastSpot + 1;
        }

        lastSpot = bin;
        points[index] = bin;
    }

    return points;
};

const generateExponents: (size: number) => Uint32Array = size => {
    const exponents = new Uint32Array(size);

    for (let index = 0; index < size; index++) {
        exponents[index] = MAX_EXPONENT + (MIN_EXPONENT - MAX_EXPONENT) * (index / size);
    }

    return exponents;
};

const points = generatePoints(SIZE);
const exponents = generateExponents(SIZE);
const maxPoints = new Uint32Array(SIZE);
const reduced = new Uint8Array(SIZE);
const transformed = new Uint8Array(SIZE);
const percents = new Float32Array(SIZE);

export const reduce: (
    frequencies: Uint8Array,
    min?: number,
    max?: number,
    logScale?: number,
    start?: number,
    end?: number,
) => Float32Array = (frequencies, min = 0, max = 255, logScale = 2.55, start = 4, end = 1200) => {
    // return empty array if frequencies is empty
    if (frequencies.length < SIZE) {
        return new Float32Array(SIZE);
    }

    // update maxPoints
    for (let spotIndex = 0; spotIndex < SIZE; spotIndex++) {
        let currentSpot = points[spotIndex];
        let nextSpot = points[spotIndex + 1];
        if (nextSpot == null) {
            nextSpot = end;
        }

        let currentMax = frequencies[currentSpot];
        let maxSpot = currentSpot;
        let diff = nextSpot - currentSpot;
        for (let index = 1; index < diff; index++) {
            let newSpot = currentSpot + index;
            if (frequencies[newSpot] > currentMax) {
                currentMax = frequencies[newSpot];
                maxSpot = newSpot;
            }
        }
        maxPoints[spotIndex] = maxSpot;
    }

    // update reduce
    for (let index = 0; index < SIZE; index++) {
        let nextMaxSpot = maxPoints[index];
        let lastMaxSpot = maxPoints[index - 1];
        if (lastMaxSpot == null) {
            lastMaxSpot = start;
        }
        let lastMax = frequencies[lastMaxSpot];
        let nextMax = frequencies[nextMaxSpot];

        reduced[index] = Math.round((lastMax + nextMax) / 2);
    }

    // exponential transform
    for (let index = 0, length = SIZE; index < length; index++) {
        transformed[index] = Math.max(Math.pow(reduced[index] / max, exponents[index]) * max, 1);
    }

    // to percent
    for (let index = 0, length = SIZE; index < length; index++) {
        let value = transformed[index];

        let diff = value - min;
        let percent = diff / max;

        if (percent > 1) {
            percent = 1;
        } else if (percent < 0) {
            percent = 0;
        } else if (!percent) {
            percent = 0;
        }

        percent = Number.isFinite(percent) ? percent : 0;

        percents[index] = percent;
    }

    return percents;
};
