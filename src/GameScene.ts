import * as PIXI from 'pixi.js';
import polylabel from 'polylabel';
import { ConfigModel } from './shared/models/ConfigModel';
import {Textures} from './load';
import { OutlineFilter } from '@pixi/filter-outline';
import { State } from './shared/models/StateModel';


const PLAYERS_COLORS = [
    0xff1b5b,
    0x3effc2,
    0xffa651,
    0xc051ff,
    0xff1bfc,
    0x6d50ff,
    0xfbff59,
    0x3eebff,
];

const NEUTRAL_COLOR = 0x5dff5f;

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
    size: number;

    constructor(index, polygon, centerX, centerY, size) {
        this.centerX = centerX;
        this.centerY = centerY;

        this.dicesGraphics = new PIXI.Graphics();
        this.dicesGraphics.filters = [
            new OutlineFilter(2, DICE_OUTLINE_COLOR),
        ];
        this.backgroundGraphics = new PIXI.Graphics();

        this.polygon = new PIXI.Polygon(polygon);
        
        this.index = index;
        this.size = size;

        this.drawShadow();
    }

    update(owner: number, dices: number) {
        this.owner = owner;
        this.dices = dices;
    }

    drawDices(texture: PIXI.Texture) {
        // Dices
        this.dicesGraphics.removeChildren();
        if(this.dices < 5) {
            this.drawTower(this.centerX, this.centerY, texture, this.dices);
        } else {
            const offsetX = this.size / 2;
            const offsetY = this.size / 4;
            
            // Left
            this.drawTower(this.centerX - offsetX, this.centerY - offsetY, texture, this.dices - 4);
            // Right tower
            this.drawTower(this.centerX + offsetX, this.centerY + offsetY, texture, 4);
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

    private drawTower(x: number, y: number, texture: PIXI.Texture, count: number) {
        const step = this.size;
        for(let i = 0; i < count; i++) {
            this.drawDice(x, y, texture);
            y -= step;
        }
    }

    private drawDice(x: number, y: number, texture: PIXI.Texture) {
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.x = x;
        sprite.y = y;

        const maxSide = Math.max(sprite.width, sprite.height)
        sprite.width = sprite.width / maxSide * this.size;
        sprite.height = sprite.height / maxSide * this.size;
        this.dicesGraphics.addChild(sprite);
    }

    private drawShadow() {
        this.shadow = new PIXI.Graphics();
        this.shadow.beginFill(SHADOW_COLOR);
        this.shadow.drawCircle(
            this.centerX + this.size,
            this.centerY - this.size,
            this.size * 1.5
        );
        this.shadow.endFill();
        this.shadow.filters = [new PIXI.filters.BlurFilter(4)];
    }
}

export class GameScene {
    private areas: Area[];
    private drawOrder: number[];
    private app: PIXI.Application;
    private graphicsAreas: PIXI.Graphics;
    private textures;

    constructor(config: ConfigModel, container: HTMLElement, textures: Textures) {
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
        const paddingWidth = this.app.screen.width/20;
        const paddingHeight = this.app.screen.height/20;

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

        let diceSize = Infinity;
        
        const areaPolygons = config.areas.map((rawPolygon, index) => {
            let polygon = rawPolygon.map(([x, y]) => [
                x * minCoeff + shiftX,
                y * minCoeff + shiftY,
            ]);

            const [centerX, centerY] = polylabel([polygon], 100);

            polygon.forEach(([x, y]) => {
                const distance = Math.sqrt(
                    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                
                if (diceSize > distance) {
                    diceSize = distance;
                }
            });
            return [polygon.flat(), centerX, centerY];
        });
        
        diceSize = diceSize * 0.9;

        this.areas = areaPolygons.map(([polygon, centerX, centerY], index) => {
            const area = new Area(index, polygon, centerX, centerY, diceSize);
            this.graphicsAreas.addChild(area.backgroundGraphics);
            this.graphicsAreas.addChild(area.shadow);
            return area;
        });
        
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
            area.drawDices(this.textures[textureName]);
        });
    }
}
