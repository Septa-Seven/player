import {Session} from "./Session";
import * as PIXI from 'pixi.js';
import {GameScene} from './GameScene';

export abstract class AbstractPlayerContext {
    session: Session
    gameScene: GameScene
    slider: any
    
    constructor(session: Session, gameSceneContainer: HTMLElement, textures) {
        const gameScene = new GameScene(
            session.config,
            gameSceneContainer,
            textures
        );

        this.addHooks(gameScene);

        this.session = session;
        this.gameScene = gameScene;
    }

    protected abstract addHooks(gameScene: GameScene): void;
}

export class PlayerContext extends AbstractPlayerContext {
    protected addHooks(gameScene) {
        
    }
}