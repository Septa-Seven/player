import { AreaModel } from './AreaModel';
import {CommandModel} from './CommandModel'
import {PlayerModel} from './PlayerModel'

export interface TurnModel {
    info: {
        command: CommandModel;
        player: number;
    }

    state: {
        areas: AreaModel[];
        current_player_index: number;
        players: PlayerModel[];
    }
}