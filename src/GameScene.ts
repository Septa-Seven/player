import * as PIXI from 'pixi.js';
import polylabel from 'polylabel';
import { Config } from './shared/models/Config';
import {Textures} from './load';
import { OutlineFilter } from '@pixi/filter-outline';


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

const OUTLINE_COLOR = 0x000;


export class Area {
    index: number;
    owner: number;
    dices: number;

    dicesGraphics: PIXI.Graphics;
    backgroundGraphics: PIXI.Graphics;
    polygon: PIXI.Polygon;
    centerX: number;
    centerY: number;

    constructor(index, polygon) {
        this.dicesGraphics = new PIXI.Graphics();
        this.dicesGraphics.filters = [
            new OutlineFilter(2, 0x000000),
        ];
        this.backgroundGraphics = new PIXI.Graphics();

        [this.centerX, this.centerY] = polylabel([polygon], 100);
        this.polygon = new PIXI.Polygon(polygon.flat());
        
        this.index = index;
        // TODO: Calculate sprite width and height.
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
        this.backgroundGraphics.lineStyle(2, OUTLINE_COLOR, 1);
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
            backgroundColor: 0x7e8991,
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

        const maxAxis = Math.max(maxX - minX, maxY - minY);

        const coeffWidth = (this.app.screen.width - paddingWidth)/maxAxis;
        const coeffHeight = (this.app.screen.height - paddingHeight)/maxAxis;

        let shiftX: number;
        let shiftY: number;
        {
            const areaCenterX = coeffWidth * (maxX + minX) / 2;
            const areaCenterY = coeffHeight * (maxY + minY) / 2;

            const centerX = this.app.screen.width / 2;
            const centerY = this.app.screen.height / 2;

            shiftX = centerX - areaCenterX;
            shiftY = centerY - areaCenterY;
        }

        this.diceSpriteScale = Math.min(coeffWidth, coeffHeight);
        
        this.areas = config.areas.map((rawPolygon, index) => {
            let polygon = rawPolygon.map(([x, y]) => [
                x * coeffWidth + shiftX,
                y * coeffHeight + shiftY,
            ]);

            let area = new Area(index, polygon);
            this.graphicsAreas.addChild(area.backgroundGraphics);
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

    setAreaClickHook(hook) {
        this.areas.forEach(area => {
            if (!area.backgroundGraphics.interactive) {
                area.backgroundGraphics.interactive = true;
            }

            area.backgroundGraphics.on('pointerdown', hook(area));
        });
    }

    handleState(state) {
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
