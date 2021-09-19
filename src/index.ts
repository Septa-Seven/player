import {Player} from "./Player";
import {PlayerContext} from './PlayerContext'
import './assets/styles/index.css';
import 'nouislider/dist/nouislider.css';
import {AreaTipManager} from './hooks';
import {mockData} from './shared/models/mock';
import {Session} from "./Session";
import { loadInitialResources } from "./load";

const stopButton = document.getElementById('stop');
const startButton = document.getElementById('start');

const sliderContainer = document.getElementById('slider');
const gameSceneContainer = document.getElementById('vizualizer');
const session = new Session(mockData);

// TODO: Strongly type dice enum
const textures = loadInitialResources([
    {name: 'dice0', url: 'images/0.png'},
    {name: 'dice1', url: 'images/1.png'},
    {name: 'dice2', url: 'images/2.png'},
    {name: 'dice3', url: 'images/3.png'},
    {name: 'dice4', url: 'images/4.png'},
    {name: 'dice5', url: 'images/5.png'},
    {name: 'dice6', url: 'images/6.png'},
    {name: 'dice7', url: 'images/7.png'},
    {name: 'dice8', url: 'images/8.png'},
]);

const playerContext = new PlayerContext(session, gameSceneContainer, textures)

const player = new Player(playerContext, sliderContainer);

stopButton.addEventListener('click', player.stop.bind(player))
startButton.addEventListener('click', player.play.bind(player))
