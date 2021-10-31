import { Session } from './Session';
import { TurnModel } from './shared/models/TurnModel';

enum CallbackMethods {
    Start = 'start',
    Stop = 'stop',
    Restart = 'start',
    ToTurn = 'toTurn',
}

export class Player {
    private session: Session;
    private currentTurn: number;
    private timer: NodeJS.Timeout;
    private callbacks: Record<string, ((turn: TurnModel) => any)[]>;
    private rewindSpeed: number;

    constructor(session: Session) {
        this.callbacks = {
            'start': [],
            'stop': [],
            'restart': [],
            'toTurn': [],
        }

        this.session = session;

        this.currentTurn = 0;
        this.rewindSpeed = 50;
    }
    
    subscribe(method: string, callback: (turn: TurnModel) => any) {
        this.callbacks[method].push(callback);
    }

    start() {
        if (!this.timer) {
            const timer = setInterval(() => this.rewind(), this.rewindSpeed);
            this.timer = timer;
        }
        
        this.invokeCallbacks(CallbackMethods.Start);
    }

    restart() {
        this.toTurn(0);
        this.invokeCallbacks(CallbackMethods.Restart);
    }

    stop() {
        clearInterval(this.timer);
        this.timer = null;
        this.invokeCallbacks(CallbackMethods.Stop);
    }

    toTurn(currentTurn: number) {
        if (currentTurn < 0) {
            currentTurn = this.session.turns.length + currentTurn;
        }
        this.currentTurn = currentTurn;
        this.invokeCallbacks(CallbackMethods.ToTurn);
    }

    getTurn(turn: number): TurnModel {
        return this.session.turns[turn];
    }

    setSpeed(speed: number) {
        this.rewindSpeed = speed;
        if (this.timer) {
            clearInterval(this.timer);
            const timer = setInterval(() => this.rewind(), this.rewindSpeed);
            this.timer = timer;
        }
    }

    private rewind() {
        if (this.currentTurn > this.session.turns.length - 1) {
            this.stop();
            return;
        }
        this.toTurn(this.currentTurn + 1);
    }

    private invokeCallbacks(method: CallbackMethods) {
        this.callbacks[method].forEach((callback) => {
            callback(this.getTurn(this.currentTurn))
        });
    }
}
