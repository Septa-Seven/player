
import {API} from 'nouislider';
import * as noUiSlider from 'nouislider';


export class Player {
    private context: AbstractPlayerContext;
    private currentTurn: number;
    private timer: NodeJS.Timeout;
    private slider: API;

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
    }

    play() {
        if(!this.timer) {
            const timer = setInterval(() => this.nextTurn(), 200);
            this.timer = timer;
        }
    }

    stop() {
        clearInterval(this.timer);
        this.timer = null;
    }

    rewind(logCount) {
        this.currentTurn = logCount;
        this.drawTurn(this.currentTurn);
    }

    drawTurn(currentTurn: number) {
        console.log(this.context, 'asdfasdfsa')
        this.context.gameScene.handleState(this.context.session.turns[this.currentTurn].state);
    }

    nextTurn() {
        if(this.currentTurn > this.context.session.turns.length - 1) {
            this.stop();
            return;
        }
        this.drawTurn(this.currentTurn);
        this.currentTurn++;
        this.slider.set(this.currentTurn)
    }
}

