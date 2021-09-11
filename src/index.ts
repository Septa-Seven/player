import {Player} from "./Player";
import {PlayerContext} from './PlayerContext'
import './assets/styles/index.css';
import 'nouislider/dist/nouislider.css';
import {AreaTipManager} from './hooks'
import {mockData} from './shared/models/mock';
import {Session} from "./Session";
import { loadInitialResources } from "./load";
import cubick from './assets/images/1.png';

const stopButton = document.getElementById('stop');
const startButton = document.getElementById('start');

const sliderContainer = document.getElementById('slider');
const gameSceneContainer = document.getElementById('vizualizer');
const session = new Session(mockData);
const loader = loadInitialResources({name: 'cubik', url: cubick});

const playerContext = new PlayerContext(session, gameSceneContainer, loader)

const player = new Player(playerContext, sliderContainer);

stopButton.addEventListener('click', player.stop.bind(player))
startButton.addEventListener('click', player.play.bind(player))
