export class Table {
    records: Map<number, HTMLDivElement>;
    
    constructor(container: HTMLDivElement, players: {id: number, name: string}[]) {
        const tableContainer = document.createElement('div');
        tableContainer.classList.add("table");
        //     <div id="info">
        //     <div class="record died">
        //       <div class="playerName">Boba</div>
        //       <div class="savings">5</div>
        //       <div class="status">Disconnected</div>
        //     </div>
        //   </div>

        
        const records = new Map();
        players.forEach(({id, name}) => {
            const recordContainer = document.createElement('div');
            // Name
            const nameContainer = document.createElement('p');
            if (name !== null) {
                nameContainer.innerHTML = name;
            }

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
        });
        
        container.appendChild(tableContainer);
        this.records = records;
    }

    set(id: number, savings: number, error?: string) {
        const recordContainer = this.records.get(id);

        const savingsContainer = recordContainer.getElementsByClassName("savings")[0];
        savingsContainer.innerHTML = savings.toString();

        const errorContainer = recordContainer.getElementsByClassName("error")[0];
        errorContainer.innerHTML = error.toString();
    }
}
