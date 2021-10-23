import {AbstractPlayerContext} from './PlayerContext';

export interface IPlayer {
    start: () => void;
    stop: () => void;
    restart: () => void;
    subscribe: (method: string, callback: () => any) => void;
}

export class Player implements IPlayer {
    private context: AbstractPlayerContext;
    private currentTurn: number;
    private timer: NodeJS.Timeout;
    private callbacks: Record<string, ((turn: any) => any)[]>;

    constructor(context: AbstractPlayerContext, sliderContainer: HTMLElement) {
        // TODO: typed callbacks for each method
        this.callbacks = {
            'start': [],
            'stop': [],
            'restart': [],
            'rewind': [],
        }

        this.context = context;

        this.currentTurn = 0;
        this.drawTurn(this.currentTurn);
    }
    
    subscribe(method: string, callback: (turn: any) => any) {
        this.callbacks[method].push(callback);
    }

    start() {
        if (!this.timer) {
            const timer = setInterval(() => this.rewind(), 200);
            this.timer = timer;
        }
        
        this.callbacks['start'].forEach((callback) => callback());
    }

    restart() {
        this.toTurn(0);
        this.callbacks['restart'].forEach((callback) => callback());
    }

    stop() {
        clearInterval(this.timer);
        this.timer = null;
        this.callbacks['stop'].forEach((callback) => callback());
    }

    toTurn(currentTurn: number) {
        this.currentTurn = currentTurn;
        this.drawTurn(this.currentTurn);
    }

    private drawTurn(currentTurn: number) {
        this.context.gameScene.setState(this.context.session.turns[this.currentTurn].state);
    }

    private rewind() {
        if(this.currentTurn > this.context.session.turns.length - 2) {
            this.stop();
            return;
        }
        this.drawTurn(this.currentTurn);
        this.currentTurn++;

        this.callbacks['rewind'].forEach((callback) => callback(this.currentTurn));
    }
}
