import { ViewStore } from './types';
import { VIEW__UPDATE } from './constants';

export const viewUpdate = (data: Partial<ViewStore>) => ({ type: VIEW__UPDATE, data } as const);

