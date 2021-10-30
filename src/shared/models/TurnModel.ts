import {CommandModel} from './CommandModel'
import {State} from './StateModel';

export interface TurnModel {
    turn: number,
    
    transition: {
        command: CommandModel;
        player: number;
        error?: string;
    }

    state: State
}