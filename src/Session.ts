import {AreaModel} from './shared/models/AreaModel'
import {WinnersModel} from './shared/models/WinnersModel'
import {TurnModel} from './shared/models/TurnModel'

export class Session {
    config: AreaModel;
    turns: TurnModel[];
    winners: WinnersModel;

    constructor(logs) {
        const parsedDate = logs.split('\n');
        this.config = JSON.parse(parsedDate[0]);
        this.winners = JSON.parse(parsedDate[parsedDate.length - 1]);

        const parsedLogs = parsedDate.slice(1, parsedDate.length - 1).map((log) => JSON.parse(log));
        const turns = [];
        for(let i = 0; i < parsedLogs.length; i += 2) {
            const turn = {
                info: parsedLogs[i + 1],
                state: parsedLogs[i],
            }
            turns.push(turn);
        }
        this.turns = turns;
        console.log(this.config, this.turns, this.winners)

    }
}
