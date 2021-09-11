import {GraphModel} from './GraphModel';

export interface AreaModel {
    areas: number[][];
    eliminate_every_n_round: number;
    graph: GraphModel;
}