import get from 'lodash/get';

export default function(object, path) {
    let result = get(object, path, undefined);

    if (result) {
        return result;
    }

    if (typeof result === 'number') {
        return result;
    }

    if (result === undefined) {
        return undefined;
    } else {
        return null;
    }
}
