import {ConfigModel} from './shared/models/ConfigModel';
import {RanksModel} from './shared/models/RanksModel';
import {TurnModel} from './shared/models/TurnModel';

export class Session {
    playerNames: Map<number, string>;
    config: ConfigModel;
    turns: TurnModel[];
    ranks: RanksModel;

    constructor(logs) {
        const parsedDate = logs.split('\n');
        this.config = JSON.parse(parsedDate[0]);
        this.ranks = JSON.parse(parsedDate[parsedDate.length - 1]);

        const parsedLogs = parsedDate.slice(1, parsedDate.length - 1).map((log) => JSON.parse(log));
        const turns = [];
        for(let i = 0; i < parsedLogs.length; i += 2) {
            const turn = {
                turn: i / 2,
                transition: parsedLogs[i + 1],
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
