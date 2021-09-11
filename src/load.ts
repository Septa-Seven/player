import * as PIXI from 'pixi.js';

interface ResourcePath {
    url: string;
    name: string;
}

export const loadInitialResources = (path: ResourcePath | ResourcePath[]): PIXI.Loader  => {
    const loader = PIXI.Loader.shared;

    if(Array.isArray(path)) {
        path.map(({url, name}) => loader.add(name, url))
    }
    else loader.add(path.name, path.url);

    loader.load();
    return loader;
}

