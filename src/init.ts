import { Player } from "./Player";
import { Session } from "./Session";
import { Textures } from "./load";
import { Info } from "./Info";
import { GameScene } from "./GameScene";
import {createIcon} from './utils/createIcon'
import { CommandType } from "./shared/models/CommandModel";

const SELECTED_AREA_COLOR = 0x111;

enum ButtonType {
    Start = 'Start',
    Play = 'Play',
    End = 'End',
}

enum ButtonIcon {
    Play = 'play',
    Stop = 'stop',
    Start = 'step-backward',
    End = 'step-forward',
}

export const createButtons = (container: HTMLElement) => {
    let buttons: Record<string, HTMLElement> = {};
    const buttonsContainer = document.createElement("div");    
    buttonsContainer.classList.add("buttons");

    for (let buttonType in ButtonType) {
        const button = document.createElement("button");

        button.setAttribute('id', buttonType)
        button.setAttribute('class', 'button')
        createIcon(button, ButtonIcon[buttonType]);
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
        startButton.innerHTML = '';
        createIcon(startButton, ButtonIcon.Stop)
    });

    player.subscribe('stop', (turn) => {
        startButton.dataset.state = 'start';
        startButton.innerHTML = '';
        createIcon(startButton, ButtonIcon.Play)
    });

    startButton.addEventListener('click', () => {
        if(startButton.dataset.state === 'start') {
            player.play.call(player);
        }
        else {
            player.stop.call(player);
        }
    });

    buttons[ButtonType.Start].addEventListener('click', player.jumpToTurn.bind(player, 0));
    buttons[ButtonType.End].addEventListener('click', player.jumpToTurn.bind(player, -1));

    // Rewind speed
    const speedSlider = createSpeedSlider(bottomContainer);

    speedSlider.addEventListener("input", () => {
        player.setSpeed(500 - Number(speedSlider.value));
    });

    // Game scene draw and attack animation
    player.subscribe('rewind', (turn) => {
        // Attack animation
        if (turn.transition && turn.transition.command.type == CommandType.Attack) {
            const command = turn.transition.command;
            
            const fromIndex = command.data.from;
            const toIndex = command.data.to;
            
            const areaFrom = gameScene.getArea(fromIndex);
            const areaTo = gameScene.getArea(toIndex);

            // Select area from
            areaFrom.drawBackground(SELECTED_AREA_COLOR);

            // Then select area to
            setTimeout(() => {
                areaTo.drawBackground(SELECTED_AREA_COLOR);
            }, 1);

            // Then transit to new state
            // TODO: Auto rewind
            setTimeout(() => {
                // Manual update of only two involved areas to gain performance
                const fromData = turn.state.areas[fromIndex];
                const toData = turn.state.areas[toIndex];
                areaFrom.update(fromData.owner, fromData.dices);
                areaTo.update(toData.owner, toData.dices);
                gameScene.redrawArea(fromIndex);
                gameScene.redrawArea(toIndex);
            }, player.rewindSpeed - 5);
        } else {
            gameScene.setState(turn.state);
        }
    });

    player.subscribe('jumpToTurn', (turn) => {
        // Fully update game scene
        gameScene.setState(turn.state);
        
        // Update info
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
    })

    player.subscribe('changeTurn', (turn) => {
        // Update slider
        slider.value = turn.turn.toString();
    });

    // Turn slider
    slider.addEventListener("input", () => {
        player.jumpToTurn(Number(slider.value));
        player.stop();
    });
}
