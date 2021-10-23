import { Player } from "./Player";
import { PlayerContext } from "./PlayerContext";
import { createButtons } from "./PlayerControl";
import { Session } from "./Session";
import { Textures } from "./load";

const createTable = (container: HTMLElement): void => {
//     <div id="info">
//     <div class="record died">
//       <div class="playerName">Boba</div>
//       <div class="status">Disconnected</div>
//       <div class="savings">5</div>
//     </div>
//   </div>
}

const createSlider = (container: HTMLElement, turns: number): HTMLInputElement => {
    const slider = document.createElement("input");
    slider.classList.add('slider', 'slider-progress');
    slider.setAttribute('type', 'range');
    slider.setAttribute('min', '0');
    slider.setAttribute('max', turns.toString());
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
    container.appendChild(gameSceneContainer);
    return gameSceneContainer;
}

export const initGame = (container: HTMLElement, textures: Textures, session: Session): void => {
    const gameSceneContainer = createGameSceneContainer(container);
    const slider = createSlider(container, session.turns.length);
    const controlContainer = createControlContainer(container);
    
    const playerContext = new PlayerContext(session, gameSceneContainer, textures);

    const player = new Player(playerContext, slider);
    const playerControl = createButtons(player, controlContainer);

    slider.addEventListener("input", () => {
        player.toTurn(Number(slider.value));
        player.stop();
    });

    player.subscribe('rewind', (turn) => {
        slider.value = turn;
    });
}
