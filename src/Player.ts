import {Session} from "./Session";
import {GameScene} from "./GameScene";
import {API} from 'nouislider';
import * as noUiSlider from 'nouislider';

class Player {
    private session: Session;
    private gameScene: GameScene;
    private currentTurn: number;
    private timer: NodeJS.Timeout;
    private slider: API;

    constructor(session, slider, gameScene) {
        this.session = session;

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
        console.log(this.gameScene.handleState)
        this.gameScene.handleState(this.session.turns[this.currentTurn].state);
    }

    nextTurn() {
        if(this.currentTurn > this.session.turns.length - 1) {
            this.stop();
            return;
        }
        this.drawTurn(this.currentTurn);
        this.currentTurn++;
        this.slider.set(this.currentTurn)
    }
}

export function createPlayer(session: Session, gameSceneContainer: HTMLElement, sliderContainer:HTMLElement): Player {
    const gameScene = new GameScene(
        session.config,
        gameSceneContainer
    );

    const slider = noUiSlider.create(sliderContainer, {
        start: [0],
        step: 1,
        range: {
            'min': [0],
            'max': [session.turns.length - 1],
        }
    });

    const player = new Player(session, slider, gameScene);
    return player;
}
