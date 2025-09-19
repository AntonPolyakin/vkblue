import { GlobalStore } from '../index';

export const getScrobblerAuth: (state: GlobalStore) => boolean = ({ scrobbler }) => scrobbler.auth;

export const getScrobblerEnabled: (state: GlobalStore) => boolean = ({ scrobbler }) => scrobbler.enabled;

export const getScrobblerProcessing: (state: GlobalStore) => boolean = ({ scrobbler }) => scrobbler.processing;

export const getScrobblerSuccess: (state: GlobalStore) => boolean = ({ scrobbler }) => scrobbler.success;
