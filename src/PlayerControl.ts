import { IPlayer } from "./Player";

export interface IPlayerControl {
    setStateStopButton: (state: StopButtonStates) => void;
}

export enum StopButtonStates {
    stop = 'stop',
    restart = 'restart'
}

export class PlayerControl implements IPlayerControl{
    private start: HTMLElement;
    private stop: HTMLElement;
    private stopButtonState: StopButtonStates;
    private player: IPlayer;

    constructor(player: IPlayer, start: string, stop: string) {
        this.start = document.getElementById(start);
        this.stop = document.getElementById(stop);
        this.stopButtonState = StopButtonStates.stop;
        this.player = player;

        this.start.addEventListener('click', player.play.bind(player))
        this.stop.addEventListener('click', this.setActionStopButton.bind(this))
    }

    setStateStopButton(state: StopButtonStates) {
        this.stopButtonState = state
        this.stop.innerHTML = StopButtonStates[state];
    }    

    setActionStopButton() {
        if(this.stopButtonState === StopButtonStates.stop) {
            this.player.stop.call(this.player)
        }

        else {
            this.player.restart.call(this.player)
        }
    }
}