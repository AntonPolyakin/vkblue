export default function getBitrate(state) {
    const { duration = 0 } = state.data.vk.base;
    const { size = 0 } = state.data.vk;
    const kbit = size / 128;

    return Math.ceil(Math.round(kbit / duration) / 16) * 16;
}
