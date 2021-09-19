import * as PIXI from 'pixi.js';
import polylabel from 'polylabel';
import { Config } from './shared/models/Config';
import {Textures} from './load';

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
    owner: number;
    dices: number;

    graphics: PIXI.Graphics;
    polygon: PIXI.Polygon;
    centerX: number;
    centerY: number;

    constructor(polygon) {
        this.graphics = new PIXI.Graphics();

        [this.centerX, this.centerY] = polylabel([polygon], 100);
        this.polygon = new PIXI.Polygon(polygon.flat());

        // TODO: Calculate sprite width and height.
    }

    update(owner: number, dices: number, color: number, scale: number, texture: PIXI.Texture) {
        this.owner = owner;
        this.dices = dices;
        this.draw(color, scale, texture);
    }

    draw(color: number, scale: number, texture: PIXI.Texture) {
        this.graphics.clear();
        this.graphics.removeChildren();
        console.log(texture);
        // Dices
        if(this.dices < 5) {
            this.drawTower(this.centerX, this.centerY, scale, texture, this.dices);
        } else {
            const offsetX = texture.width * scale / 2;
            const offsetY = texture.height * scale / 2;
            
            // Left
            this.drawTower(this.centerX - offsetX, this.centerY - offsetY, scale, texture, this.dices - 4);
            // Right tower
            this.drawTower(this.centerX + offsetX, this.centerY + offsetY, scale, texture, 4);
        }
        
        // Outline
        this.graphics.lineStyle(2, OUTLINE_COLOR, 1);
        this.graphics.beginFill(color);
        this.graphics.drawPolygon(this.polygon);
        this.graphics.endFill();
    }

    private drawTower(x: number, y: number, scale: number, texture: PIXI.Texture, count: number) {
        const step = texture.height / 2;
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
        sprite.width *= scale;
        sprite.height *= scale;
        this.graphics.addChild(sprite);
    }
}

export class GameScene {
    private areas: Area[];
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

        this.diceSpriteScale = 0.9 * Math.min(coeffWidth, coeffHeight);

        this.areas = config.areas.map((rawPolygon, index) => {
            let polygon = rawPolygon.map(([x, y]) => [
                x * coeffWidth + shiftX,
                y * coeffHeight + shiftY,
            ]);

            let area = new Area(polygon);
            this.graphicsAreas.addChild(area.graphics);
            return area;
        });
    }

    addAreaHook(hookName, hook) {
        this.areas.forEach((area, index) => {
            if (!area.graphics.interactive) {
                area.graphics.interactive = true;
            }
            // area.graphics.on(hookName, hook(area, index))
        });
    }

    handleState(state) {
        this.graphicsAreas.clear();

        state.areas.forEach((areaData, index) => {
            let area = this.areas[index];
            let color, textureName;
            if (areaData.owner === null) {
                color = NEUTRAL_COLOR;
                textureName = 'dice8';
            } else {
                color = PLAYERS_COLORS[areaData.owner];
                textureName = 'dice' + areaData.owner;
            }

            console.log(textureName, this.textures, this.diceSpriteScale, Object.keys(this.textures));
            area.update(
                areaData.owner,
                areaData.dices,
                color,
                this.diceSpriteScale,
                this.textures[textureName]
            );
        });
    }
}
