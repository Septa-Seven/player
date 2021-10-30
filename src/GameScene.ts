import * as PIXI from 'pixi.js';
import polylabel from 'polylabel';
import { Config } from './shared/models/ConfigModel';
import {Textures} from './load';
import { OutlineFilter } from '@pixi/filter-outline';
import { State } from './shared/models/StateModel';


const PLAYERS_COLORS = [
    0xad1514,
    0x0073ac,
    0x009882,
    0x009900,
    0xbc9000,
    0xab0196,
    0x000092,
    0xc94c00,
];

const NEUTRAL_COLOR = 0x555555;

const AREA_OUTLINE_COLOR = 0x000;

const DICE_OUTLINE_COLOR = 0x000;

const BACKGROUND_COLOR = 0x7e8991;

const SHADOW_COLOR = 0x000;

export class Area {
    index: number;
    owner: number;
    dices: number;

    dicesGraphics: PIXI.Graphics;
    backgroundGraphics: PIXI.Graphics;
    shadow: PIXI.Graphics;
    polygon: PIXI.Polygon;
    centerX: number;
    centerY: number;

    constructor(index, polygon) {
        this.dicesGraphics = new PIXI.Graphics();
        this.dicesGraphics.filters = [
            new OutlineFilter(2, DICE_OUTLINE_COLOR),
        ];
        this.backgroundGraphics = new PIXI.Graphics();

        [this.centerX, this.centerY] = polylabel([polygon], 100);
        this.polygon = new PIXI.Polygon(polygon.flat());
        
        this.shadow = new PIXI.Graphics();
        this.shadow.beginFill(SHADOW_COLOR);
        this.shadow.drawEllipse(this.centerX + 5, this.centerY + 5, 5, 5);
        this.shadow.endFill();
        this.shadow.filters = [new PIXI.filters.BlurFilter()];

        this.index = index;
    }

    update(owner: number, dices: number) {
        this.owner = owner;
        this.dices = dices;
    }

    drawDices(scale: number, texture: PIXI.Texture) {
        // Dices
        this.dicesGraphics.removeChildren();
        if(this.dices < 5) {
            this.drawTower(this.centerX, this.centerY, scale, texture, this.dices);
        } else {
            const offsetX = scale / 2;
            const offsetY = scale / 4;
            
            // Left
            this.drawTower(this.centerX - offsetX, this.centerY - offsetY, scale, texture, this.dices - 4);
            // Right tower
            this.drawTower(this.centerX + offsetX, this.centerY + offsetY, scale, texture, 4);
        }
    }

    drawBackground(color) {
        this.backgroundGraphics.clear();
        // Outline
        this.backgroundGraphics.lineStyle(2, AREA_OUTLINE_COLOR, 1);
        this.backgroundGraphics.beginFill(color);
        this.backgroundGraphics.drawPolygon(this.polygon);
        this.backgroundGraphics.endFill();
    }

    private drawTower(x: number, y: number, scale: number, texture: PIXI.Texture, count: number) {
        const step = 1 * scale;
        for(let i = 0; i < count; i++) {
            this.drawDice(x, y, scale, texture);
            y -= step;
        }
    }

    private drawDice(x: number, y: number, scale: number, texture: PIXI.Texture) {
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.x = x;
        sprite.y = y;

        const maxSide = Math.max(sprite.width, sprite.height)
        sprite.width = 2 * sprite.width/maxSide * scale;
        sprite.height = 2 * sprite.height/maxSide * scale;
        this.dicesGraphics.addChild(sprite);
    }
}

export class GameScene {
    private areas: Area[];
    private drawOrder: number[];
    private app: PIXI.Application;
    private graphicsAreas: PIXI.Graphics;
    private textures;
    private diceSpriteScale: number;

    constructor(config: Config, container: HTMLElement, textures: Textures) {
        this.graphicsAreas = new PIXI.Graphics();
        let app = new PIXI.Application({
            width: container.clientWidth,
            height: container.clientHeight,
            backgroundColor: BACKGROUND_COLOR,
            antialias: true,
        });
        
        this.textures = textures;

        container.appendChild(app.view);
        
        app.stage.addChild(this.graphicsAreas);
        this.app = app;

        this.createAreas(config);
    }

    private createAreas(config) {
        this.graphicsAreas.removeChildren();

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        config.areas.forEach(rawPolygon => {
            rawPolygon.map(([x, y]) => {
                minX = Math.min(x, minX);
                minY = Math.min(y, minY);
                maxX = Math.max(x, maxX);
                maxY = Math.max(y, maxY);
            })
        });

        // This much space left on scene borders to draw UI
        const paddingWidth = this.app.screen.width/6;
        const paddingHeight = this.app.screen.height/6;

        const coeffWidth = (this.app.screen.width - paddingWidth)/(maxX - minX);
        const coeffHeight = (this.app.screen.height - paddingHeight)/(maxY - minY);
        const minCoeff = Math.min(coeffWidth, coeffHeight);

        let shiftX: number;
        let shiftY: number;
        {
            const areaCenterX = (maxX + minX) / 2;
            const areaCenterY = (maxY + minY) / 2;

            const screenCenterX = this.app.screen.width / 2;
            const screenCenterY = this.app.screen.height / 2;

            shiftX = screenCenterX - minCoeff * areaCenterX;
            shiftY = screenCenterY - minCoeff * areaCenterY;
        }

        let diceSpriteScale = Infinity;
        
        this.areas = config.areas.map((rawPolygon, index) => {
            let polygon = rawPolygon.map(([x, y]) => [
                x * minCoeff + shiftX,
                y * minCoeff + shiftY,
            ]);

            let area = new Area(index, polygon);

            polygon.forEach(([x, y]) => {
                const distance = Math.sqrt(
                    Math.pow(x - area.centerX, 2) + Math.pow(y - area.centerY, 2));
                
                if (diceSpriteScale > distance) {
                    diceSpriteScale = distance;
                }
            });

            // Register area graphics
            this.graphicsAreas.addChild(area.backgroundGraphics);
            this.graphicsAreas.addChild(area.shadow);
            return area;
        });
        this.diceSpriteScale = diceSpriteScale / 2;
        
        this.drawOrder = [...Array(this.areas.length).keys()]
        this.drawOrder.sort((areaIndex1, areaIndex2) => {
            const a1 = this.areas[areaIndex1];
            const a2 = this.areas[areaIndex2];
            const diff = a1.centerY - a2.centerY;
            if (diff == 0) {
                return a1.centerX - a2.centerX;
            }
            return diff;
        });
        this.drawOrder.forEach(areaIndex => {
            const area = this.areas[areaIndex];
            this.graphicsAreas.addChild(area.dicesGraphics);
        });
    }

    addAreaClickHook(hook) {
        this.areas.forEach(area => {
            if (!area.backgroundGraphics.interactive) {
                area.backgroundGraphics.interactive = true;
            }

            area.backgroundGraphics.on('pointerdown', hook(area));
        });
    }

    setState(state: State) {
        this.graphicsAreas.clear();

        state.areas.forEach((areaData, index) => {
            let area = this.areas[index];
            let color: number;
            if (areaData.owner === null) {
                color = NEUTRAL_COLOR;
            } else {
                color = PLAYERS_COLORS[areaData.owner];
            }

            area.update(
                areaData.owner,
                areaData.dices,
            );
            
            area.drawBackground(color);
        });

        this.drawOrder.forEach(areaIndex => {
            const area = this.areas[areaIndex];
            let textureName: string;
            if (area.owner === null) {
                textureName = 'dice8';
            } else {
                textureName = 'dice' + area.owner;
            }
            area.drawDices(this.diceSpriteScale, this.textures[textureName]);
        });
    }
}
