import { fixString } from './fixString';

export const createArtistAndTitleKey = (artist: string, title: string) => {
    return `${fixString(artist)}--${fixString(title)}`;
};
