let activityChart = null; // Riferimento al grafico per evitare duplicati

/**
 * Recupera i dati delle attività giornaliere e aggiorna il grafico.
 */
async function loadActivityChart() {

    try {
        const data = await window.electronAPI.getDailyProjectTimeEntries();
        console.log("📊 Dati ricevuti:", data);

        if (!data || data.length === 0) {
            console.warn("⚠️ Nessuna attività registrata oggi.");
            renderEmptyChart(); // Se non ci sono dati, mostriamo un grafico vuoto
            return;
        }

        // Estraggo i nomi dei progetti, la durata e i colori
        const projectNames = data.map(entry => entry.project_name);
        const projectDurations = data.map(entry => entry.total_minutes);
        const projectColors = data.map((entry, index) => {
            if (entry.project_color) {
                return entry.project_color; // Usa il colore del tag se esiste
            } else {
                // Genera una scala di grigi con ancora più differenza senza limitazione inferiore
                const stepSize = 20; // Aumentiamo la differenza
                const grayStep = 200 - (index * stepSize); // Rimuoviamo il limite inferiore
                return `rgb(${grayStep}, ${grayStep}, ${grayStep})`;
            }
        });    
        console.log("📊 Dati ricevuti:", { projectNames, projectDurations, projectColors });

        // Creiamo o aggiorniamo il grafico
        updateActivityChart(projectNames, projectDurations, projectColors);
    } catch (error) {
        console.error("❌ Errore nel caricamento del grafico attività:", error);
        renderEmptyChart();
    }
}

// Definiamo il plugin floatingLabels per posizionare i nomi sopra le barre
const floatingLabels = {
    id: 'floatingLabels',
    afterDatasetsDraw(chart) {
        const { ctx, data } = chart;
        ctx.save();
        ctx.font = "13px Arial";
        ctx.textAlign = "left"; // Allinea il testo a sinistra

        chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            if (!meta.hidden) {
                meta.data.forEach((bar, index) => {
                    const label = dataset.label;
                    const xPosition = bar.x - bar.width + 8; // Posiziona leggermente a sinistra
                    const yPosition = bar.y - 15; // Posiziona sopra la barra
                    
                    ctx.fillStyle = dataset.backgroundColor; // Colore del testo
                    ctx.fillText(label.toUpperCase(), xPosition, yPosition);
                });
            }
        });

        ctx.restore();
    }
};

// Definisci un positioner personalizzato per centrare il tooltip sopra il segmento
const customTooltip = {
    id: 'customTooltip',
    afterDatasetsDraw(chart, args, plugins) {
        const { ctx } = chart;
        ctx.save();

        chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);

            // Iteriamo su TUTTI i segmenti di ogni dataset
            meta.data.forEach((dataPoint, index) => {
                if (dataPoint.active) {

                    ctx.save();

                    // line
                    const widthHalf = dataPoint.width / 2;
                    ctx.beginPath();
                    ctx.strokeStyle = '#ccc';
                    ctx.moveTo(dataPoint.x - widthHalf, dataPoint.y);
                    ctx.lineTo(dataPoint.x - widthHalf, dataPoint.y - 35);
                    ctx.stroke();

                    // cloud
                    ctx.beginPath();
                    ctx.fillStyle = '#fafafa';
                    ctx.strokeStyle = '#ccc'; // Bordo grigio chiaro
                    ctx.lineWidth = 1.5; // Spessore del bordo
                    ctx.roundRect(dataPoint.x - widthHalf - 50, dataPoint.y - 80, 100, 50, 10);
                    ctx.fill();
                    ctx.stroke();

                    // title
                    ctx.font = "bold 15px Arial";
                    ctx.fillStyle = dataset.backgroundColor;
                    ctx.fillText(dataset.label, dataPoint.x - widthHalf - 50 + 10, dataPoint.y - 80 + 20);

                    // body
                    ctx.fillStyle = "#333";
                    ctx.font = "bold 14px Arial";
                    let duration = dataset.originalDuration;
                    let hours = Math.floor(duration / 60);
                    let minutes = duration % 60;
                    let timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

                    ctx.fillText(timeString, dataPoint.x - widthHalf - 50 + 10, dataPoint.y - 80 + 40);
                }
            });
        });

    }
};

/**
 * Inizializza o aggiorna il grafico delle attività in una barra continua.
 * @param {Array} labels - Nomi dei progetti
 * @param {Array} data - Minuti totali per progetto
 * @param {Array} colors - Colori delle barre
 */
function updateActivityChart(labels, data, colors) {
    
    Chart.register(floatingLabels, customTooltip);

    const ctx = document.getElementById("activityChart").getContext("2d");

    // Se il grafico esiste già, lo distruggiamo prima di crearne uno nuovo
    if (activityChart) {
        activityChart.destroy();
    }

    let cumulativeOffset = 0; // Tiene traccia della posizione orizzontale di ogni segmento

    // Trova la durata massima per normalizzare i segmenti
    const maxDuration = Math.max(...data);
    const canvasWidth = 100; // Percentuale massima di utilizzo del canvas

    activityChart = new Chart(ctx, {
        type: "bar",
        data: {
            datasets: labels.map((label, index) => {
                let normalizedWidth = (data[index] / maxDuration) * canvasWidth; // Normalizza rispetto al più grande
                let segment = { 
                    x: [cumulativeOffset, cumulativeOffset + normalizedWidth], 
                    y: "Projects" 
                };
                cumulativeOffset += normalizedWidth; // Aggiorna la posizione per il prossimo segmento

                return {
                    label: label,
                    data: [segment],
                    backgroundColor: colors[index],
                    borderColor: colors[index],
                    borderRadius: 8,
                    borderSkipped: false,
                    barPercentage: 0.5, // Controlla lo spessore delle barre
                    categoryPercentage: 0.4, // Evita spazi
                    originalDuration: data[index]
                };
            })
        },
        options: {
            layout: {
                padding: {
                    top: 60,  // Aggiunge spazio sopra
                    bottom: 0, // Rimuove spazio sotto, ancorando il grafico in basso
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y", // orizzontale per accodare le barre
            plugins: {
                legend: { display: false }, // Nasconde la legenda
                datalabels: { display: false },
                tooltip: { enabled: false },                
            },
            scales: {
                x: {
                    display: false, // Nasconde l'asse x
                    stacked: false, // Nessuna impilazione, ogni barra accodata
                    grid: { display: false }, // Rimuove completamente la griglia
                    ticks: { display: false } // Nasconde i numeri dell'asse X
                },
                y: {
                    display: false, // Nasconde l'asse y
                    stacked: true, // Nessuna impilazione, le barre devono essere accodate
                    grid: { display: false }, // Rimuove completamente la griglia
                    ticks: { display: false } // Nasconde le etichette Y
                }
            }
        },
        plugins: [floatingLabels, customTooltip] // Plugins attivi
    });

    console.log("Grafico aggiornato con barre accodate orizzontali e griglia eliminata.");
}

/**
 * Mostra un grafico vuoto se non ci sono dati disponibili.
 */
function renderEmptyChart() {
    updateActivityChart(["No Data"], [0], ["#cccccc"]); // Grafico con una barra grigia
}

/**
 * Funzione per scurire un colore esadecimale.
 * @param {string} color - Colore esadecimale
 * @param {number} percent - Percentuale di scurimento (-20 per scurire)
 * @returns {string} - Colore modificato
 */
function shadeColor(color, percent) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}

/**
 * Inizializza le funzioni della vista Activity.
 */
async function initializeActivityView() {
    console.log("🔄 Inizializzazione della vista Activity...");
    await loadActivityChart();
}

// Assicuriamoci che la funzione sia disponibile a livello globale
window.initializeActivityView = initializeActivityView;

async function loadActivityData() {
    console.log("📊 Caricamento dati attività dal database...");

    try {
        const today = new Date().toISOString().split("T")[0]; // Data odierna in formato YYYY-MM-DD
        const data = await window.electronAPI.getEntriesByDate(today); // Ottenere i dati dal database

        console.log("📌 Dati ricevuti dal database:", data); // <--- Debug per verificare i dati

        const activityList = document.getElementById("activityList");

        // Svuotiamo le liste prima di riempirle
        activityList.innerHTML = "";

        // Controllo se l'array è vuoto
        if (!data || data.length === 0) {
            console.warn("⚠️ Nessuna attività registrata oggi.");
            activityList.innerHTML = "<li class='empty-message'>Nessuna attività registrata oggi.</li>";
            return;
        }

        // Se ci sono entry, le popoliamo
        data.forEach(entry => {
            const startTime = new Date(entry.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const endTime = new Date(entry.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            const hours = Math.floor(entry.duration / 60);
            const minutes = entry.duration % 60;
            const formattedDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

            // Creiamo l'elemento lista con entrambe le colonne
            const activityItem = document.createElement("li");
            activityItem.classList.add("activity-entry");
            activityItem.innerHTML = `
                <div class="task-container">
                    <span class="task-name">${entry.task}</span> 
                    <span class="project-name">${entry.project_name}</span>
                </div>
                <div class="time-container">
                    <span class="time-spent"><strong>${formattedDuration}</strong></span> 
                    <span class="time-range">${startTime} - ${endTime}</span>
                </div>
            `;

            activityList.appendChild(activityItem);
        });

    } catch (error) {
        console.error("❌ Errore nel caricamento delle attività:", error);
    }
}