import { PlayerModel } from './PlayerModel';

export interface State {
    areas: {owner: number, dices: number}[];
    round: number;
    current_player_index: number,
    players: PlayerModel[],
}