import {GraphModel} from './GraphModel';

export interface ConfigModel {
    areas: number[][];
    eliminate_every_n_round: number;
    graph: GraphModel;
    players: number;
}