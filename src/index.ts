import {Player} from "./Player";
import {PlayerContext} from './PlayerContext'
import './assets/styles/index.css';
import './assets/styles/slider.css';

import {mockData} from './shared/models/mock';
import {Session} from "./Session";
import { DiceNames, loadInitialResources, Textures } from "./load";
import { PlayerControl } from "./PlayerControl";

const visualizerContainer = document.getElementById('visualizer');

const session = new Session(mockData);


const createControl = (container): HTMLDivElement => {
    const slider = document.createElement("input");
    slider.classList.add('slider', 'slider-progress');
    slider.setAttribute('type', 'range');
    slider.setAttribute('min', '0');
    slider.setAttribute('max', '100');
    slider.setAttribute('value', '0');
    slider.setAttribute('step', '0.1');
    
    container.appendChild(slider);
    
    <div id="visualizer"></div>
    // <div id="info">
    //   <div class="record died">
    //     <div class="playerName">Boba</div>
    //     <div class="status">Disconnected</div>
    //     <div class="savings">5</div>
    //   </div>
    // </div>
    <div class="control">
      <button id="start" class="button">start</button>
      <button id="stop" class="button">stop</button>
      <input type="range" id="slider" min="0" max="100" value="0" step="0.1" class="styled-slider slider-progress"/>
    </div>

    return slider;
}


const createSlider = (container): HTMLDivElement => {
    const slider = document.createElement('input');
    slider.classList.add('slider');
    
    <input type="range" id="slider" min="0" max="100" value="0" step="0.1" class="styled-slider slider-progress"/>
    container.appendChild(slider);

    return slider;
}

const initGame = (container, textures: Textures): void => {
    
    const slider = createSlider(container);
    const controlContainer = 
    const gameSceneContainer = 

    const playerContext = new PlayerContext(session, gameSceneContainer, textures);
    const player = new Player(playerContext, sliderContainer);
    const playerControl = new PlayerControl(player, controlContainer);

    [start].
    onclick -> player.start
}

const textures = loadInitialResources([
    {name: DiceNames.dice0, url: 'images/0.png'},
    {name: DiceNames.dice1, url: 'images/1.png'},
    {name: DiceNames.dice2, url: 'images/2.png'},
    {name: DiceNames.dice3, url: 'images/3.png'},
    {name: DiceNames.dice4, url: 'images/4.png'},
    {name: DiceNames.dice5, url: 'images/5.png'},
    {name: DiceNames.dice6, url: 'images/6.png'},
    {name: DiceNames.dice7, url: 'images/7.png'},
    {name: DiceNames.dice8, url: 'images/8.png'},
], initGame);
