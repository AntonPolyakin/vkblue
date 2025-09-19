import { useEffect, useState } from 'react';

import { getLyricsStore, offUpdateLyrics, onUpdateLyrics, requestLyrics } from './content';
import { createArtistAndTitleKey } from '../keyCreators/createArtistAndTitleKey';
import { useIsMounted } from '../../utils/useIsMounted';

type Lyrics = string | undefined | null;
type LyricsStore = { [key: string]: Lyrics };
type Hook = (artist: string, title: string) => Lyrics;

export const useLyrics: Hook = (artist, title) => {
    const [lyrics, setLyrics] = useState<LyricsStore>({});
    const lyricsKey = createArtistAndTitleKey(artist, title);
    const isMounted = useIsMounted();

    useEffect(() => {
        function handleLyricsChange(newLyrics: LyricsStore) {
            if (isMounted.current) {
                setLyrics(newLyrics);
            }
        }

        getLyricsStore(handleLyricsChange);
        onUpdateLyrics(handleLyricsChange);
        return () => {
            offUpdateLyrics(handleLyricsChange);
        };
    }, []);

    useEffect(() => {
        if (lyrics[lyricsKey] !== undefined) {
            return;
        }

        const animationFrame = requestAnimationFrame(() => {
            requestLyrics({ artist, title });
        });

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [artist, title]);

    return lyrics[lyricsKey];
};
