import {Player} from "./Player";
import {PlayerContext} from './PlayerContext'
import './assets/styles/index.css';
import './assets/styles/slider.css';

import 'nouislider/dist/nouislider.css';
import {mockData} from './shared/models/mock';
import {Session} from "./Session";
import { DiceNames, loadInitialResources, Textures } from "./load";
import { PlayerControl } from "./PlayerControl";

const sliderContainer = document.getElementById('slider');
const gameSceneContainer = document.getElementById('vizualizer');

const session = new Session(mockData);

const initGame = (textures: Textures): void => {
    const playerContext = new PlayerContext(session, gameSceneContainer, textures)
    const player = new Player(playerContext, sliderContainer);
    const playerControl = new PlayerControl(player, 'start', 'stop')
    player.setControl(playerControl);
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
