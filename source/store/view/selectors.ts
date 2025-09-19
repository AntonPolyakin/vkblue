import { GlobalStore } from '../index';
import { ViewStore } from './types';

export const getView: (state: GlobalStore) => ViewStore = ({ view }) => view;
