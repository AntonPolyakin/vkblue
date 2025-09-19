import md5 from 'blueimp-md5';

export default function generateSignature(params) {
    const signature = Object.keys(params)
        .sort()
        .reduce((previous, key) => previous + key + params[key], '');

    return md5(signature + process.env.LAST_FM_SECRET_KEY);
}
