import * as PIXI from 'pixi.js';
import polylabel from 'polylabel';
import { Config } from './shared/Config';

const PLAYERS_COLORS = [
    0xe61717,
    0xf29913,
    0xf2d813,
    0x32d937,
    0x32d9c2,
    0xb344fc,
    0xfa82ee,
    0x4537c4,
];

const PLAYERS_DICE_SPRITES = [
    
];

const NEUTRAL_COLOR = 0x555555;

const SELECTED_COLOR = 0x232526;
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
    }

    update(owner: number, dices: number, color: number, width: number, height: number, texture: PIXI.Texture) {
        this.owner = owner;
        this.dices = dices;
        this.draw(color, width, height, texture);
    }

    draw(color: number, width: number, height: number, texture: PIXI.Texture) {
        this.graphics.clear();
        this.graphics.removeChildren();
        
        // Dices
        if(this.dices < 5) {
            this.drawTower(this.centerX, this.centerY, width, height, texture, this.dices);
        } else {
            const offsetX = width / 2;
            const offsetY = height / 2;
            // Right tower
            this.drawTower(this.centerX + offsetX, this.centerY + offsetY, width, height, texture, 4);
            // Left 
            this.drawTower(this.centerX - offsetX, this.centerY - offsetY, width, height, texture, this.dices - 4);
        }
        this.graphics.addChild(diceText);
        
        // Outline
        this.graphics.lineStyle(2, OUTLINE_COLOR, 1);
        this.graphics.beginFill(color);
        this.graphics.drawPolygon(this.polygon);
        this.graphics.endFill();
    }

    private drawTower(x: number, y: number, width: number, height: number, texture, count: number) {
        for(let i = 0; i < count; i++) {
            this.drawDice(x, y, texture);
            y += height;
        }
    }

    private drawDice(x, y, width: number, height: number, texture) {
        const sprite = new PIXI.Sprite(texture);
        sprite.x = x;
        sprite.y = y;
        sprite.width = width;
        sprite.height = height;
    }
}

export class GameScene {
    private areas: Area[];
    private app: PIXI.Application;
    private graphicsAreas: PIXI.Graphics;
    private loader: PIXI.Loader;
    private diceSpriteWidth: number;
    private diceSpriteHeight: number;

    constructor(config: Config, container: HTMLElement, loader: PIXI.Loader) {
        this.graphicsAreas = new PIXI.Graphics();
        let app = new PIXI.Application({
            width: container.clientWidth,
            height: container.clientHeight,
            backgroundColor: 0x7e8991,
            antialias: true,
        });
        
        this.loader = loader;

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
        const paddingWidth = this.app.screen.width/4;
        const paddingHeight = this.app.screen.height/4;

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

        // TODO: Calculate sprite width and height.
        this.diceSpriteWidth = 0.5 * coeffWidth;
        this.diceSpriteHeight = 0.5 * coeffHeight;

        this.areas = config.areas.map((rawPolygon, index) => {
            // TODO: calculate center

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
            const color = owner === null ? NEUTRAL_COLOR : PLAYERS_COLORS[owner];
            area.update(
                areaData.owner,
                areaData.dices,
                color,
                this.diceSpriteWidth,
                this.diceSpriteHeight,
                this.loader.resources['cubik'].texture
            );
        });
    }
}
