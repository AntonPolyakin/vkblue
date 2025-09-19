import { FilterValues } from '../store/equalizer/types';
import { LOAD_EQUALIZER, UPDATE_BIQUAD_FILTERS } from '../constants';

export const updateBiquadFilters = (filters: FilterValues) => ({ type: UPDATE_BIQUAD_FILTERS, data: filters });
export const loadEqualizer = () => ({ type: LOAD_EQUALIZER } as const);
