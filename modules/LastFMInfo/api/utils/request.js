import superagent from 'superagent';

export default function request({ method, data }) {
    return new Promise((resolve, reject) => {
        const payload = Object.assign({}, data, {
            format: 'json',
        });

        superagent(method, 'http://ws.audioscrobbler.com/2.0/')
            .type('form')
            .query(method === 'GET' ? payload : {})
            .send(method === 'POST' ? payload : null)
            .end((err, response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response.body);
                }
            });
    });
}
