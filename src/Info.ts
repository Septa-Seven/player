export class Info {
    records: Map<number, HTMLElement>;
    
    constructor(container: HTMLElement, playerNames: Map<number, string>) {
        const infoContainer = document.createElement('div');
        infoContainer.classList.add("info");
        
        //     <div id="info">
        //     <div class="record died">
        //       <div class="playerName">Boba</div>
        //       <div class="savings">5</div>
        //       <div class="status">Disconnected</div>
        //     </div>
        //   </div>

        const records = new Map();
        for (const [id, name] of playerNames.entries()) {
            const recordContainer = document.createElement('div');
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
            errorContainer.innerHTML = 'Все хуево';
            recordContainer.appendChild(errorContainer);

            records.set(id, recordContainer);
        }
        
        container.appendChild(infoContainer);
        this.records = records;
    }

    set(id: number, savings: number, error?: string) {
        const recordContainer = this.records.get(id);

        const savingsContainer = recordContainer.getElementsByClassName("savings")[0];
        savingsContainer.innerHTML = savings.toString();
        
        const errorContainer = recordContainer.getElementsByClassName("error")[0];
        errorContainer.innerHTML = error === null ? "" : error.toString();
    }
}
