import { IPlayer } from "./Player";

const buttonTypes = ['start', 'stop']

export class PlayerControl{
    private player: IPlayer;

    constructor(player: IPlayer, container: HTMLElement) {
        this.player = player;

        const buttons = buttonTypes.map((type) => {
            const button = document.createElement("button");
            button.setAttribute('id', type)
            button.setAttribute('class', 'button')
            return button;
        })

        buttons.map((button) => {
            container.appendChild(button)
        })
    }
}