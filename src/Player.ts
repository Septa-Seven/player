
import {API} from 'nouislider';
import * as noUiSlider from 'nouislider';
import {AbstractPlayerContext} from './PlayerContext';
import { IPlayerControl, StopButtonStates } from './PlayerControl';

export interface IPlayer {
    play: () => void;
    stop: () => void;
    restart: () => void;
}

export class Player implements IPlayer{
    private context: AbstractPlayerContext;
    private currentTurn: number;
    private timer: NodeJS.Timeout;
    private slider: API;
    private playerControl: IPlayerControl;

    constructor(context: AbstractPlayerContext, sliderContainer: HTMLElement) {
        const slider = noUiSlider.create(sliderContainer, {
            start: [0],
            step: 1,
            range: {
                'min': [0],
                'max': [context.session.turns.length - 1],
            }
        });

        this.context = context;

        slider.on('update', (turn) => {
            this.rewind(Math.floor(turn));
        })
        
        slider.on('end', () => {
            this.stop()
        })


        this.slider = slider;
        this.currentTurn = 0;
        this.drawTurn(this.currentTurn);
    }

    setControl(playerControl: IPlayerControl) {
        this.playerControl = playerControl;
    }

    play() {
        if(!this.timer) {
            const timer = setInterval(() => this.nextTurn(), 200);
            this.timer = timer;
        }
    }

    restart() {
        this.rewind(0);
        this.playerControl.setStateStopButton(StopButtonStates.stop);
    }

    stop() {
        clearInterval(this.timer);
        this.timer = null;
    }

    private rewind(logCount) {
        this.currentTurn = logCount;
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

