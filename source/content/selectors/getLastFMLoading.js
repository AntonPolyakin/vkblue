export default function getLastFMLoading(state) {
    return state.data.lastfm.track === undefined && state.data.lastfm.artist === undefined;
}
