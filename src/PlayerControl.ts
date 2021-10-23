import { IPlayer } from "./Player";

const buttonTypes = ['start', 'stop'];

export const createButtons = (player: IPlayer, container: HTMLElement) => {
    let buttons: Record<string, HTMLElement> = {};

    buttonTypes.forEach((type) => {
        const button = document.createElement("button");
        button.setAttribute('id', type)
        button.setAttribute('class', 'button')
        buttons[type] = button;
    });

    Object.values(buttons).forEach((button) => {
        container.appendChild(button)
    });
    
    buttons['start'].addEventListener('click', player.start.bind(player))
    buttons['stop'].addEventListener('click', player.stop.bind(player))
}
