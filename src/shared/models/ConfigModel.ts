import {GraphModel} from './GraphModel';

export interface ConfigModel {
    visuals: {
        polygon: [number, number][],
        center: [number, number],
        radius: number
    }[];
    eliminate_every_n_round: number;
    graph: GraphModel;
    players: number;
}