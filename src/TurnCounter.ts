export class TurnCounter {
    turns: number;
    currentTurn: HTMLElement;

    constructor(container: HTMLElement, turns: number){
        this.turns = turns;
        const turnCounter = document.createElement("p")
        turnCounter.classList.add('turn-counter')

        const currentTurn = document.createElement("span")
        currentTurn.id = 'current-turn'
        currentTurn.innerHTML = '0'
    

        const lastTurn = document.createElement("span")
        lastTurn.innerHTML = turns.toString()

        const separator = document.createElement("span")
        separator.classList.add('turn-counter__separator')

        turnCounter.append(currentTurn)
        turnCounter.append(separator)
        turnCounter.append(lastTurn)
        container.append(turnCounter);

        this.currentTurn = document.getElementById('current-turn')
    }

    setCurrentTurh(turn: number) {
        console.log(this.currentTurn)
        this.currentTurn.innerHTML = turn.toString()
    }
}