import {difference} from './utils/difference';


export class Info {
    records: Map<number, HTMLElement>;
    
    constructor(container: HTMLElement, playerNames: Map<number, string>) {
        const infoContainer = document.createElement('div');
        infoContainer.classList.add("info");

        const records = new Map();
        for (const [id, name] of playerNames.entries()) {
            const recordContainer = document.createElement('div');
            recordContainer.classList.add('record')
            
            // Name
            const nameContainer = document.createElement('p');

            nameContainer.innerHTML = name;

            nameContainer.classList.add("name")
            recordContainer.appendChild(nameContainer);
            
            // Savings
            const savingsContainer = document.createElement('p');
            savingsContainer.classList.add("savings")
            savingsContainer.innerHTML = '0';
            recordContainer.appendChild(savingsContainer);
            
            // Error
            const errorContainer = document.createElement('p');
            errorContainer.classList.add("error")
            recordContainer.appendChild(errorContainer);

            
            infoContainer.appendChild(recordContainer);
            records.set(id, recordContainer);
        }
        
        container.appendChild(infoContainer);
        this.records = records;
    }

    setSavings(id: number, savings: number) {
        const recordContainer = this.records.get(id);

        const savingsContainer = recordContainer.getElementsByClassName("savings")[0];
        savingsContainer.innerHTML = savings.toString();
        
    }

    setError(id: number, error: string) {
        const recordContainer = this.records.get(id);
        const errorContainer = recordContainer.getElementsByClassName("error")[0];
        errorContainer.innerHTML = error  ? error.toString() : "";
    }

    elimination(alivePlayers: number[]) {
        const all = new Set(this.records.keys());
        const alive = new Set(alivePlayers);

        const deadPlayers = difference(all, alive);

        for (const id of deadPlayers) {
            const infoContainer = this.records.get(id);
            infoContainer.classList.add('eliminated');
        }

        for (const id of alive) {
            const infoContainer = this.records.get(id);
            infoContainer.classList.remove('eliminated');
        }
    }
}

