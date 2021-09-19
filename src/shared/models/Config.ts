import {GraphModel} from './GraphModel';

export interface Config {
    areas: number[][];
    eliminate_every_n_round: number;
    graph: GraphModel;
}