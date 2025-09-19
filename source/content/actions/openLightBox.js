import { OPEN_LIGHT_BOX } from '../stores/lightbox/action-types';

export default function openLightBox(name) {
    return dispatch => {
        dispatch({ type: OPEN_LIGHT_BOX, data: { name } });
    };
}
