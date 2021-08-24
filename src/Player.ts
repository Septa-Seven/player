import {Session} from "./Session";
import {GameScene} from "./GameScene";
import {API} from 'nouislider';

export class Player {
    session: Session;
    gameScene: GameScene;
    currentTurn: number;
    timer: NodeJS.Timeout;
    slider: API;

    constructor(session, slider, gameScene) {
        this.session = session;

        gameScene.handleStartMessage(session.areas)
        this.gameScene = gameScene;

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
        console.log('stop');
        clearInterval(this.timer);
        this.timer = null;
    }

    rewind(logCount) {
        this.currentTurn = logCount;
        this.drawTurn(this.currentTurn);
    }

    drawTurn(currentTurn: number) {
        this.gameScene.handleStateMessage(this.session.turns[this.currentTurn].state);
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
