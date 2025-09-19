import { CLOSE_LIGHT_BOX } from '../stores/lightbox/action-types';

export default function closeLightBox() {
    return dispatch => {
        dispatch({ type: CLOSE_LIGHT_BOX });
    };
}
