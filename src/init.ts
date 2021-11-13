import { Player } from "./Player";
import { Session } from "./Session";
import { Textures } from "./load";
import { Info } from "./Info";
import { GameScene } from "./GameScene";
import {createIcon} from './utils/createIcon'

enum ButtonType {
    Start = 'Start',
    Play = 'Play',
    End = 'End',
}

export const createButtons = (container: HTMLElement) => {
    let buttons: Record<string, HTMLElement> = {};
    const buttonsContainer = document.createElement("div");    

    buttonsContainer.classList.add("buttons");
    for (let buttonType in ButtonType) {
        const button = document.createElement("button");
        button.setAttribute('id', buttonType)
        button.setAttribute('class', 'button')
        createIcon(button, 'fa-user');
        button.innerHTML = buttonType;
        buttons[buttonType] = button;
    }

    Object.values(buttons).forEach((button) => {
        buttonsContainer.appendChild(button)
    });

    container.appendChild(buttonsContainer);

    return buttons;
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

const createBottomContainer = (container: HTMLElement): HTMLElement => {
    const bottomContainer = document.createElement('div');
    bottomContainer.classList.add('bottom-container');
    container.appendChild(bottomContainer)
    return bottomContainer;
}

const createSpeedSlider = (container: HTMLElement): HTMLInputElement => {
    const slider = document.createElement("input");
    slider.classList.add('speed-slider');
    slider.setAttribute('type', 'range');
    slider.setAttribute('min', '0');
    slider.setAttribute('max', '450');
    slider.setAttribute('value', '0');
    slider.setAttribute('step', '1');
    
    container.appendChild(slider);

    return slider;
}

const createGameSceneContainer = (container: HTMLElement): HTMLElement => {
    const gameSceneContainer = document.createElement('div');
    gameSceneContainer.classList.add("scene");
    container.appendChild(gameSceneContainer);
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

    const bottomContainer = createBottomContainer(controlContainer);

    const info = new Info(container, session.playerNames);
    
    const gameScene = new GameScene(
        session.config,
        gameSceneContainer,
        textures,
    );

    const player = new Player(session);
    gameScene.setState(player.getTurn(0).state);
    
    // Buttons
    const buttons = createButtons(bottomContainer);

    const startButton = buttons[ButtonType.Play];
    startButton.dataset.state = 'start';

    player.subscribe('play', (turn) => {
        startButton.dataset.state = 'stop';
        startButton.innerHTML = 'Stop';
    });

    player.subscribe('stop', (turn) => {
        startButton.dataset.state = 'start';
        startButton.innerHTML = 'Play';
    });

    startButton.addEventListener('click', () => {
        if(startButton.dataset.state === 'start') {
            player.play.call(player);
        }
        else {
            player.stop.call(player);
        }
    });

    buttons[ButtonType.Start].addEventListener('click', player.toTurn.bind(player, 0));
    buttons[ButtonType.End].addEventListener('click', player.toTurn.bind(player, -1));

    // Rewind speed
    const speedSlider = createSpeedSlider(bottomContainer);

    speedSlider.addEventListener("input", () => {
        player.setSpeed(500 - Number(speedSlider.value));
    });

    player.subscribe('toTurn', (turn) => {
        gameScene.setState(turn.state);
    });

    slider.addEventListener("input", () => {
        player.toTurn(Number(slider.value));
        player.stop();
    });

    player.subscribe('toTurn', (turn) => {
        slider.value = turn.turn.toString();
    });
 
    player.subscribe('toTurn', (turn) => {
        gameScene.setState(turn.state);
    });

    player.subscribe('toTurn', (turn) => {
        turn.state.players.forEach(({id, savings}) => {
            info.setSavings(id, savings);
        });
        
        if (turn.transition.error) {
            info.setError(
                turn.transition.player_id,
                turn.transition.error,
            )
        }
        
        info.elimination(turn.state.players.map(({id}) => id));
    });
}
