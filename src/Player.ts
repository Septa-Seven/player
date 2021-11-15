import { Session } from './Session';
import { TurnModel } from './shared/models/TurnModel';

enum CallbackMethods {
    Play = 'play',
    Stop = 'stop',
    Restart = 'start',
    JumpToTurn = 'jumpToTurn',
    Rewind = 'rewind',
    ChangeTurn = 'changeTurn',
}

export class Player {
    private session: Session;
    private currentTurn: number;
    private timer: NodeJS.Timeout;
    private callbacks: Record<string, ((turn: TurnModel) => any)[]>;
    rewindSpeed: number;

    constructor(session: Session) {
        this.callbacks = {
            'play': [],
            'stop': [],
            'restart': [],
            'jumpToTurn': [],
            'rewind': [],
            'changeTurn': [],
        }

        this.session = session;

        this.currentTurn = 0;
        this.rewindSpeed = 100;
    }
    
    subscribe(method: string, callback: (turn: TurnModel) => any) {
        this.callbacks[method].push(callback);
    }

    play() {
        if (!this.timer) {
            const timer = setInterval(() => this.rewind(), this.rewindSpeed);
            this.timer = timer;
        }
        
        this.invokeCallbacks(CallbackMethods.Play);
    }

    restart() {
        this.changeTurn(0);
        this.invokeCallbacks(CallbackMethods.Restart);
    }

    stop() {
        clearInterval(this.timer);
        this.timer = null;
        this.invokeCallbacks(CallbackMethods.Stop);
    }

    jumpToTurn(currentTurn: number) {
        this.changeTurn(currentTurn);
        this.invokeCallbacks(CallbackMethods.JumpToTurn);
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
        this.changeTurn(this.currentTurn + 1);
        this.invokeCallbacks(CallbackMethods.Rewind);
    }

    private changeTurn(currentTurn) {
        if (currentTurn < 0) {
            currentTurn = this.session.turns.length + currentTurn;
        }
        this.currentTurn = currentTurn;
        this.invokeCallbacks(CallbackMethods.ChangeTurn);
    }

    private invokeCallbacks(method: CallbackMethods) {
        this.callbacks[method].forEach((callback) => {
            callback(this.getTurn(this.currentTurn))
        });
    }
}
