export abstract class AbstractPlayerContext {
    session: Session
    gameScene: GameScene
    slider: any
    
    constructor(session: Session, gameSceneContainer: HTMLElement, loader: PIXI.Loader) {
        const gameScene = new GameScene(
            session.config,
            gameSceneContainer,
            loader
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