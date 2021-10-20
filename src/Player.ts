import {AbstractPlayerContext} from './PlayerContext';
import { IPlayerControl, StopButtonStates } from './PlayerControl';

export interface IPlayer {
    play: () => void;
    stop: () => void;
    restart: () => void;
    setControl: (playerControl: IPlayerControl) => void;
}

export class Player implements IPlayer{
    private context: AbstractPlayerContext;
    private currentTurn: number;
    private timer: NodeJS.Timeout;
    private playerControl: IPlayerControl;
    private callbacks: Record<string, (() => any)[]>;

    constructor(context: AbstractPlayerContext, sliderContainer: HTMLElement) {
        this.callbacks = {
            'play': [],
            'stop': [],
            'restart': [],
        }

        const slider = noUiSlider.create(sliderContainer, {
            start: [0],
            step: 1,
            range: {
                'min': [0],
                'max': [context.session.turns.length - 1],
            }
        });

        slider.on('update', (turn) => {
            this.rewind(Math.floor(turn));
        })
        
        slider.on('end', () => {
            this.stop()
        })

        this.context = context;

        this.currentTurn = 0;
        this.drawTurn(this.currentTurn);
    }

    subscribe(method: string, callback: () => any) {
        this.callbacks[method].push(callback);
    }

    play() {
        if(!this.timer) {
            const timer = setInterval(() => this.nextTurn(), 200);
            this.timer = timer;
        }
        
        this.callbacks['start'].forEach((callback) => callback());
    }

    restart() {
        this.rewind(0);
        this.playerControl.setStateStopButton(StopButtonStates.stop);
        this.callbacks['restart'].forEach((callback) => callback());
    }

    stop() {
        clearInterval(this.timer);
        this.timer = null;
        this.callbacks['stop'].forEach((callback) => callback());
    }

    rewind(currentTurn: number) {
        this.currentTurn = currentTurn;
        this.drawTurn(this.currentTurn);
    }

    private drawTurn(currentTurn: number) {
        this.context.gameScene.setState(this.context.session.turns[this.currentTurn].state);
    }

    private nextTurn() {
        if(this.currentTurn > this.context.session.turns.length - 2) {
            this.stop();
            this.playerControl.setStateStopButton(StopButtonStates.restart);
            return;
        }
        this.drawTurn(this.currentTurn);
        this.currentTurn++;
        this.slider.set(this.currentTurn)
    }
}

