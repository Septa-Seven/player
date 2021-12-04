import './assets/styles/index.css';
import { mockData } from './shared/mock';
import {Session, loadResources, DiceNames} from "dice-wars-game-scene";
import { initGame } from './init';

const visualizerContainer = document.getElementById('visualizer');

const session = new Session(mockData);
session.setPlayerName(0, 'Biba');
session.setPlayerName(1, 'BOB');

loadResources([
    {name: DiceNames.dice0, url: 'assets/images/0.png'},
    {name: DiceNames.dice1, url: 'assets/images/1.png'},
    {name: DiceNames.dice2, url: 'assets/images/2.png'},
    {name: DiceNames.dice3, url: 'assets/images/3.png'},
    {name: DiceNames.dice4, url: 'assets/images/4.png'},
    {name: DiceNames.dice5, url: 'assets/images/5.png'},
    {name: DiceNames.dice6, url: 'assets/images/6.png'},
    {name: DiceNames.dice7, url: 'assets/images/7.png'},
    {name: DiceNames.dice8, url: 'assets/images/8.png'},
], visualizerContainer, session, initGame);
