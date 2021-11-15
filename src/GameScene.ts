import * as PIXI from 'pixi.js';
import maxInscribedCircle from 'max-inscribed-circle';
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

const DICES_COLORS = [
    [1, 0.7, 0.8],
    [0.7, 1, 0.9],
    [1, 0.7, 0.5],
    [0.8, 0.5, 1],
    [1, 0.5, 0.95],
    [0.6, 0.5, 1],
    [0.95, 1, 0.5],
    [0.4, 0.8, 1],
    [0.3, 0.3, 0.3]
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
    color: number;
    offsetX: number;
    offsetY: number;

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
        this.offsetX = this.size / 4;
        this.offsetY = this.size / 8;

        this.drawShadow();
    }

    update(owner: number, dices: number) {
        this.owner = owner;
        this.dices = dices;
    }

    drawDices(texture: PIXI.Texture) {
        // Create reusable sprites
        if (this.dicesGraphics.children.length < this.dices) {
            for (let i = this.dicesGraphics.children.length; i < this.dices; i++) {
                const sprite = new PIXI.Sprite(texture);
                sprite.anchor.set(0.5);

                const maxSide = Math.max(sprite.width, sprite.height)
                sprite.width = sprite.width / maxSide * this.size;
                sprite.height = sprite.height / maxSide * this.size;

                sprite.filters = [new PIXI.filters.ColorMatrixFilter()]
                
                this.dicesGraphics.addChild(sprite);
                
                // Dices 4 - 7 will stand still with constant coordinates
                if (i > 3) {
                    sprite.x = this.centerX - this.offsetX;
                    sprite.y = this.centerY - (i - 5) * this.size / 2 - this.offsetY;
                }
            }
        }

        // Activate all used dices
        for (let i = 0; i < this.dices; i++) {
            const sprite = this.dicesGraphics.getChildAt(i);
            sprite.visible = true;
            if (!Object.is(sprite.texture, texture)) {
                sprite.texture = texture;
            }
        }

        // Deactivate unused dices
        for (let i = this.dices; i < this.dicesGraphics.children.length; i++) {
            const sprite = this.dicesGraphics.getChildAt(i);
            sprite.visible = false;
        }

        // Change positions of right tower
        for (let i = 0; i < Math.min(4, this.dices); i++) {
            const sprite = this.dicesGraphics.getChildAt(i);
            sprite.x = this.centerX + this.offsetX;
            sprite.y = this.centerY - i * this.size / 2 + this.offsetY;
        }
    }

    drawBackground(color) {
        this.color = color;

        this.backgroundGraphics.clear();
        // Outline
        this.backgroundGraphics.lineStyle(2, AREA_OUTLINE_COLOR, 1);
        this.backgroundGraphics.beginFill(color);
        this.backgroundGraphics.drawPolygon(this.polygon);
        this.backgroundGraphics.endFill();
    }

    private drawShadow() {
        this.shadow = new PIXI.Graphics();
        this.shadow.beginFill(SHADOW_COLOR);
        this.shadow.drawCircle(
            this.centerX + this.size/4,
            this.centerY + this.size/4,
            this.size / 2
        );
        this.shadow.endFill();
        this.shadow.filters = [new PIXI.filters.BlurFilter(1)];
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
        config.visuals.forEach(({polygon}) => {
            polygon.forEach(([x, y]) => {
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
        
        const areaPolygons = config.visuals.map(({polygon, center, radius}) => {
            polygon = polygon.map(([x, y]) => [
                Math.round(x * minCoeff + shiftX),
                Math.round(y * minCoeff + shiftY),
            ]);

            radius *= minCoeff;

            if (diceSize > radius) {
                diceSize = radius;
            }

            let [centerX, centerY] = center;
            centerX = centerX * minCoeff + shiftX;
            centerY = centerY * minCoeff + shiftY;

            return [polygon, centerX, centerY];
        });

        this.areas = areaPolygons.map(([polygon, centerX, centerY], index) => {
            const area = new Area(index, polygon.flat(), centerX, centerY, diceSize);
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
            
            area.update(
                areaData.owner,
                areaData.dices,
            );
        });

        this.drawOrder.forEach(areaIndex => {
            this.redrawArea(areaIndex);
        });
    }

    getArea(index: number): Area {
        return this.areas[index];
    }

    redrawArea(index) {
        const area = this.areas[index];

        let color: number;
        if (area.owner === null) {
            color = NEUTRAL_COLOR;
        } else {
            color = PLAYERS_COLORS[area.owner];
        }
        
        area.drawBackground(color);

        let textureName: string;
        if (area.owner === null) {
            textureName = 'dice8';
        } else {
            textureName = 'dice' + area.owner;
        }
        area.drawDices(this.textures[textureName]);
    }
}
