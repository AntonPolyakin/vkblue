import { fixString } from './fixString';

const removeAlbumSubstring = (str: string) => {
    let dashSeparatorRegExp = /(?!(?<=\p{L})[\-–](?=\p{L}))[\-–]/gum;
    return str?.split(dashSeparatorRegExp)?.[0];
}

export const createArtistAndTitleKey = (artist: string, title: string) => {
    let artistStr = fixString(removeAlbumSubstring(artist));
    let titleStr = fixString(title);
    return `${artistStr}--${titleStr}`;
};
