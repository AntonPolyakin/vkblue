export default function formatBytes(state) {
    const { size } = state.data.vk;
    const bytes = size || 0;

    if (bytes === 0) {
        return '0byte';
    }

    let k = 1024;
    let dm = 1;
    let sizes = ['bytes', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb'];
    let i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
}
