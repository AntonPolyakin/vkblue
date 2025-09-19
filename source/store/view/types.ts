export type BlockName = 'info' | 'equalizer' | 'visualizer' | 'lyrics';

export type ViewStore = {
    order: [BlockName, BlockName, BlockName, BlockName];
    display: boolean;
};
