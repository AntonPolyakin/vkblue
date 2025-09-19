import superagent from 'superagent';
import generateSignature from './generate-signature';

export default function request({ method, sk, data }) {
    if (sk) {
        data.sk = sk;
    }

    return new Promise((resolve, reject) => {
        const payload = Object.assign({}, data, {
            format: 'json',
            api_sig: generateSignature(data),
        });

        superagent(method, 'http://ws.audioscrobbler.com/2.0/')
            .type('form')
            .query(method === 'GET' ? payload : {})
            .send(method === 'POST' ? payload : null)
            .end((err, response) => {
                if (err) {
                    if (response.body.error === 9) {
                        reject({
                            error: err,
                            response: response.body,
                            isUnauthorized: true,
                        });
                    } else {
                        reject({ error: err, response: response.body });
                    }
                } else {
                    resolve(response.body);
                }
            });
    });
}
