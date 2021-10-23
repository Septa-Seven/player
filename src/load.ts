import * as PIXI from 'pixi.js';
import { initGame } from './init';
import { Session } from './Session';

export enum DiceNames {
    dice0 = 'dice0',
    dice1 = 'dice1',
    dice2 = 'dice2',
    dice3 = 'dice3',
    dice4 = 'dice4',
    dice5 = 'dice5',
    dice6 = 'dice6',
    dice7 = 'dice7',
    dice8 = 'dice8',
}

interface ResourcePath {
    url: string;
    name: DiceNames;
}

export interface Textures {
    dice0: PIXI.Texture;
    dice1: PIXI.Texture;
    dice2: PIXI.Texture;
    dice3: PIXI.Texture;
    dice4: PIXI.Texture;
    dice5: PIXI.Texture;
    dice6: PIXI.Texture;
    dice7: PIXI.Texture;
    dice8: PIXI.Texture;
}

type gameInit = () => void;


export const loadInitialResources = (
    path: ResourcePath | ResourcePath[],
    container: HTMLElement,
    session: Session,
): PIXI.Loader => {
    const loader = PIXI.Loader.shared;

    if(Array.isArray(path)) {
        path.map(({url, name}) => loader.add(name, url))
    }

    else loader.add(path.name, path.url);
    const textures: Textures = {} as Textures;
    loader.load((loader, resources) => {
        for(const key in resources) {
            textures[key] = resources[key].texture;
        }
        initGame(container, textures, session);
    });

    return loader;
}

