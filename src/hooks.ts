import * as PIXI from 'pixi.js';
import { Area } from "dice-wars-game-scene";

export class AreaTipManager {
    message: PIXI.Text;

    showTip(area: Area, index: number) {
        const message = new PIXI.Text(index.toString());
        message.x = area.centerX;
        message.y = area.centerY;

        this.message = message;
        area.graphics.addChild(message);
    }

    hideTip(area: Area, index: number) {
        this.message.destroy();
    }
}
