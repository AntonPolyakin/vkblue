import { GlobalStore } from '../index';

export const getAudioPaused: (state: GlobalStore) => boolean = ({ audio }) => audio.paused;

export const getAudioPlayed: (state: GlobalStore) => boolean = ({ audio }) => !audio.paused;

export const getAudioPlayedPercent: (state: GlobalStore) => number = ({ audio }) => audio.playedPercent;
