import { Player } from "./Player";
import { Session } from "./Session";
import { Textures } from "./load";
import { Info } from "./Info";
import { GameScene } from "./GameScene";


const buttonTypes = ['start', 'stop'];


export const createButtons = (container: HTMLElement, player: Player) => {
    let buttons: Record<string, HTMLElement> = {};
    const buttonsContainer = document.createElement("div");    

    buttonsContainer.classList.add("buttons");
    buttonTypes.forEach((type) => {
        const button = document.createElement("button");
        button.setAttribute('id', type)
        button.setAttribute('class', 'button')
        button.innerHTML = type;
        buttons[type] = button;
    });

    Object.values(buttons).forEach((button) => {
        buttonsContainer.appendChild(button)
    });

    container.appendChild(buttonsContainer);
    
    buttons['start'].addEventListener('click', player.start.bind(player))
    buttons['stop'].addEventListener('click', player.stop.bind(player))
}

const createSlider = (container: HTMLElement, turns: number): HTMLInputElement => {
    const slider = document.createElement("input");
    slider.classList.add('slider', 'slider-progress');
    slider.setAttribute('type', 'range');
    slider.setAttribute('min', '0');
    slider.setAttribute('max', (turns - 1).toString());
    slider.setAttribute('value', '0');
    slider.setAttribute('step', '1');
    
    container.appendChild(slider);

    return slider;
}

const createControlContainer = (container: HTMLElement): HTMLElement => {
    const controlContainer = document.createElement('div');
    container.appendChild(controlContainer)
    return controlContainer;
}

const createGameSceneContainer = (container: HTMLElement): HTMLElement => {
    const gameSceneContainer = document.createElement('div');
    gameSceneContainer.classList.add("scene");
    container.appendChild(gameSceneContainer);
    console.log(gameSceneContainer, container);
    return gameSceneContainer;
}

const createPlayerContainer = (container: HTMLElement): HTMLElement => {
    const playerContainer = document.createElement('div');
    playerContainer.classList.add("player");
    container.appendChild(playerContainer);
    return playerContainer;
}

export const initGame = (container: HTMLElement, textures: Textures, session: Session): void => {
    const playerContainer = createPlayerContainer(container);
    const gameSceneContainer = createGameSceneContainer(playerContainer);

    const controlContainer = createControlContainer(playerContainer);
    const slider = createSlider(controlContainer, session.turns.length);

    const info = new Info(container, session.playerNames);
    
    const gameScene = new GameScene(
        session.config,
        gameSceneContainer,
        textures,
    );

    const player = new Player(session);
    const buttons = createButtons(controlContainer, player);

    slider.addEventListener("input", () => {
        player.toTurn(Number(slider.value));
        player.stop();
    });

    player.subscribe('rewind', (turn) => {
        slider.value = turn.turn.toString();
    });

    player.subscribe('rewind', (turn) => {
        gameScene.setState(turn.state);
    })

    player.subscribe('rewind', (turn) => {
        const savings = turn.state[turn.state.current_player_index].savings;
        info.set(turn.transition.player, savings, turn.transition.error);
    })
}
