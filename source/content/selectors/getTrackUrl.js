export default function getTrackUrl(state) {
    return state.data.vk.base.url.split('?')[0];
}
