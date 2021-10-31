import {ConfigModel} from './shared/models/ConfigModel';
import {RanksModel} from './shared/models/RanksModel';
import {TurnModel} from './shared/models/TurnModel';

export class Session {
    playerNames: Map<number, string>;
    config: ConfigModel;
    turns: TurnModel[];
    ranks: RanksModel;

    constructor(logs) {
        const parsedData = logs.split('\n');
        this.config = JSON.parse(parsedData[0]);
        this.ranks = JSON.parse(parsedData[parsedData.length - 1]);

        const parsedLogs = parsedData.slice(1, parsedData.length - 1).map((log) => JSON.parse(log));
        const turns = [{
            turn: 0,
            state: parsedLogs[0],
            transition: null,
        }];
        
        for(let i = 2; i < parsedLogs.length; i += 2) {
            const turn = {
                turn: i / 2,
                transition: parsedLogs[i - 1],
                state: parsedLogs[i],
            }
            turns.push(turn);
        }
        this.turns = turns;

        this.playerNames = new Map();
        
        for (let i = 0; i < this.config.players; i++) {
            this.playerNames.set(i, `Player ${i}`);
        }
    }

    setPlayerName(id: number, name: string) {
        if (id < 0 && id >= this.config.players) {
            throw new RangeError('');
        }

        this.playerNames.set(id, name);
    }
}
