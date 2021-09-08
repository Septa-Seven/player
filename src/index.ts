import {createPlayer} from "./Player";
import './assets/styles/index.css';
import 'nouislider/dist/nouislider.css';
import {AreaTipManager} from './hooks'
import {mockData} from './shared/models/mock';
import {Session} from "./Session";

const stopButton = document.getElementById('stop');
const startButton = document.getElementById('start');

const sliderContainer = document.getElementById('slider');
const gameSceneContainer = document.getElementById('vizualizer');
const session = new Session(mockData);

const player = createPlayer(session, gameSceneContainer, sliderContainer);

stopButton.addEventListener('click', player.stop.bind(player))
startButton.addEventListener('click', player.play.bind(player))
