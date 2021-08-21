import {Player} from "./Player";
import * as noUiSlider from 'nouislider';
import './assets/styles/index.css';
import 'nouislider/dist/nouislider.css';
import {mockData} from './shared/models/mock';
import {Session} from "./Session";
import {GameScene} from "./GameScene";

const stopButton = document.getElementById('stop');
const startButton = document.getElementById('start');

const sliderContainer = document.getElementById('slider');
const conainer = document.getElementById('vizualizer');

const session = new Session(mockData);
const gameScene = new GameScene(conainer);

const slider = noUiSlider.create(sliderContainer, {
    start: [0],
    range: {
        'min': [0],
        'max': [session.turns.length - 1]
    }
});

const player = new Player(session, slider, gameScene);

stopButton.addEventListener('click', player.stop.bind(player))
startButton.addEventListener('click', player.play.bind(player))
