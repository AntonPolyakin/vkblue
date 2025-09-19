import { getSettingsAnalyzerEnabled } from '../../store/settings/selectors';
import { UPDATE_BLOCKS_ORDER } from '../../constants';

export default function(name) {
    return (dispatch, getState) => {
        const state = getState();
        const order = state.view.order;
        const index = order.indexOf(name);
        const temp = order[0];

        if (name === 'visualizer' && !getSettingsAnalyzerEnabled(state)) {
            return;
        }

        order[0] = name;
        order[index] = temp;

        dispatch({ type: UPDATE_BLOCKS_ORDER, data: { order: [...order] } });
    };
}
