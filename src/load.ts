import * as PIXI from 'pixi.js';

interface ResourcePath {
    url: string;
    name: string;
}

export class Textures {
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

export const loadInitialResources = (path: ResourcePath | ResourcePath[]): Textures => {
    const loader = PIXI.Loader.shared;

    if(Array.isArray(path)) {
        path.map(({url, name}) => loader.add(name, url))
    }
    else loader.add(path.name, path.url);

    const textures = new Textures();
    loader.load((loader, resources) => {
        textures.dice0 = resources.dice0.texture;
        textures.dice1 = resources.dice1.texture;
        textures.dice2 = resources.dice2.texture;
        textures.dice3 = resources.dice3.texture;
        textures.dice4 = resources.dice4.texture;
        textures.dice5 = resources.dice5.texture;
        textures.dice6 = resources.dice6.texture;
        textures.dice7 = resources.dice7.texture;
        textures.dice8 = resources.dice8.texture;
    });
    return textures;
}

