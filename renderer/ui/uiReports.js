

async function initializeReportsView() {
    console.log("📊 Inizializzazione Reports View...");
  
    const chartContainer = document.getElementById("reportsChart");
    const projectBtn = document.getElementById("projectSelectBtn-reports");
    const projectDropdown = document.getElementById("projectDropdown-reports");
    const projectSearchInput = document.getElementById("projectSearchInput-reports");
    const projectList = document.getElementById("projectOptionsList-reports");
    const countBadge = document.getElementById("projectSelectedCount-reports");
    const exportBtn = document.getElementById("exportReportsBtn");
    const periodBtn = document.getElementById("periodTypeBtn-reports");
    const periodMenu = document.getElementById("periodTypeMenu-reports");
    const dateInput = document.getElementById("date-picker-reports");

    dateInput.disabled = true; // disabilita all'inizio

    const localeEN = {
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        months: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
  
    if (!chartContainer || !projectBtn || !projectDropdown || !projectSearchInput || !projectList || !countBadge || !exportBtn || !periodBtn || !periodMenu || !dateInput) {
      console.warn("❌ Uno o più elementi della vista Reports non trovati.");
      return;
    }
  
    let selectedProjects = [];
    let selectedPeriod = "month";
    let currentChart = null;
    let selectedWeekRange = null;


  
    await populateProjects();
    initializePeriodSelector();
    initializeDatePicker(selectedPeriod);
  
    projectBtn.addEventListener("click", () => {
      projectDropdown.classList.toggle("hidden");
    });
  
    exportBtn.addEventListener("click", handleExportReports);
  
    projectSearchInput.addEventListener("input", () => {
      filterProjectList(projectSearchInput.value);
    });

    // Chiudi il dropdown se si clicca fuori
    document.addEventListener("click", (e) => {
        const isInsideDropdown = projectDropdown.contains(e.target);
        const isTrigger = projectBtn.contains(e.target);
        if (!isInsideDropdown && !isTrigger) {
        projectDropdown.classList.add("hidden");
        }
    });

    loadReportsData();
  
    function initializePeriodSelector() {

        periodBtn.addEventListener("click", () => {
            periodMenu.classList.toggle("hidden");
        });
  
        periodMenu.querySelectorAll("li").forEach((item) => {
            item.addEventListener("click", () => {
                selectedPeriod = item.dataset.type;
                periodBtn.textContent = item.textContent;
                periodMenu.classList.add("hidden");

                dateInput.disabled = false;

                initializeDatePicker(selectedPeriod);
                loadReportsData();
            });
        });
    } 
  
    function initializeDatePicker(periodType) {
        // Distrugge il precedente se esiste
        const existing = dateInput.airDatepicker;
        if (existing) existing.destroy();
      
        const config = getDatePickerConfig(periodType);
        
        // Inizializza con config completo
        dateInput.airDatepicker = new AirDatepicker(dateInput, {
            ...config,
            locale: localeEN,
            firstDay: 1, // Monday
            navTitles: { months: 'yyyy', years: 'yyyy1 - yyyy2' },
            prevHtml: '‹',
            nextHtml: '›',
            onSelect({ date }) {
                if (periodType === "week" && date) {
                    const selectedDate = Array.isArray(date) ? date[0] : date;
                    const { start, end } = getWeekRangeFromDate(selectedDate);
                    const dp = dateInput.airDatepicker;
            
                    // Salva il range esternamente
                    selectedWeekRange = { start, end };
            
                    // Imposta il range (ma non fa il triggering)
                    dp.selectDate([start, end], { silent: true });

                    dp.update();
            
                    // Mostra solo il lunedì nell’input
                    const formatted = dp.formatDate(start, dp.opts.dateFormat);
                    dateInput.value = formatted;
            
                    loadReportsData(start);
                } else {
                    selectedWeekRange = null;
                    loadReportsData();
                }
            },            
            onRenderCell({ date, cellType }) {
                if (periodType === "week" && cellType === "day" && selectedWeekRange) {
                    const d = new Date(date).setHours(0, 0, 0, 0);
                    const s = selectedWeekRange.start.setHours(0, 0, 0, 0);
                    const e = selectedWeekRange.end.setHours(0, 0, 0, 0);
            
                    const today = new Date();
                    const isToday = d === new Date(today.setHours(0, 0, 0, 0));
            
                    if (d === s || d === e) {
                        return {
                            classes: ['custom-week-boundary'].concat(isToday ? 'override-today' : []).join(' ')
                        };
                    } else if (d > s && d < e) {
                        return {
                            classes: ['custom-week-range'].concat(isToday ? 'override-today' : []).join(' ')
                        };
                    }
                }
            
                return {};
            }                                                           
            
        });
    }
      
  
    function getDatePickerConfig(periodType) {
        switch (periodType) {
            case "day":
                return {
                    dateFormat: "dd/MM/yyyy",
                    autoClose: true,
                    view: "days"
                };
            case "week":
                return {
                    dateFormat: "dd/MM/yyyy",
                    autoClose: false,
                    view: "days",
                    toggleSelected: false
                };
            case "month":
                return {
                    view: "months",
                    minView: "months",
                    dateFormat: "MMMM yyyy",
                    autoClose: true
                };
            case "year":
                return {
                    view: "years",
                    minView: "years",
                    dateFormat: "yyyy",
                    autoClose: true
                };
                default:
                    return {};
        }
    }

    function getWeekRangeFromDate(date) {
        const selected = new Date(date);
        const day = selected.getDay(); // 0 (Sun) - 6 (Sat)
    
        // Calcola lunedì
        const monday = new Date(selected);
        monday.setDate(selected.getDate() - (day === 0 ? 6 : day - 1));
    
        // Calcola domenica
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
    
        return { start: monday, end: sunday };
    }    

    async function populateProjects() {
      const projects = await window.electronAPI.getAllProjects();
      projectList.innerHTML = "";
  
      projects.forEach((project) => {
        const li = document.createElement("li");
        li.classList.add("project-option-item");
        li.innerHTML = `<label style="display: flex; align-items: center; gap: 8px; width: 100%;">
                            <input type="checkbox" class="custom-checkbox" value="${project.id}" /> ${project.name}</label>`;
        projectList.appendChild(li);
      });
  
    projectList.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
        
        checkbox.addEventListener("change", () => {

            selectedProjects = Array.from(

                projectList.querySelectorAll("input[type='checkbox']:checked")
                ).map((cb) => parseInt(cb.value));
                const count = selectedProjects.length;

                if (count > 0) {
                    countBadge.textContent = count;
                    countBadge.classList.remove("hidden");
                    // Aggiunge animazione "bump"
                    countBadge.classList.add("bump");
                    setTimeout(() => countBadge.classList.remove("bump"), 300);
                } else {
                    countBadge.classList.add("hidden");
                }

                loadReportsData();

            });
        });
    }
  
    function filterProjectList(query) {
      const items = projectList.querySelectorAll("li");
      items.forEach((li) => {
        const text = li.textContent.toLowerCase();
        li.style.display = text.includes(query.toLowerCase()) ? "block" : "none";
      });
    }

    function toIsoDateString(date) {
        if (!date) return null;
    
        try {
            const localDate = new Date(date);
            // Imposta manualmente ore/minuti per evitare lo shift
            localDate.setHours(12, 0, 0, 0); 
            return localDate.toISOString().split("T")[0];
        } catch {
            return null;
        }
    }   
    
    function generateStaticLabels(period) {
        switch (period) {
            case "day":
                return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
            case "week":
                return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            case "month": {
                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                return Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));
            }
            case "year":
                return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            default:
                return [];
        }
    }
    
    async function loadReportsData(customDate = null) {
        const rawDate = customDate || dateInput?.airDatepicker?.selectedDates?.[0];
        const isoDate = toIsoDateString(rawDate);
    
        if (currentChart && typeof currentChart.destroy === "function") {
            currentChart.destroy();
        }
    
        if (!selectedProjects.length || !isoDate || !selectedPeriod) {
            const ctx = document.getElementById("reportsChart")?.getContext("2d");
            if (!ctx) return;
    
            currentChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: [],
                    datasets: [{
                        label: "Hours Logged",
                        data: [],
                        backgroundColor: "#e5e7eb"
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true }, x: {} }
                }
            });
    
            return;
        }
    
        const safePayload = {
            projectIds: selectedProjects.map(id => Number(id)),
            period: String(selectedPeriod),
            date: String(isoDate)
        };
    
        console.log("📦 Payload IPC:", JSON.stringify(safePayload, null, 2));
    
        const aggregatedData = await window.electronAPI.getAggregatedTimeEntries(safePayload);
        console.log("📊 Dati aggregati:", aggregatedData);
    
        const labels = generateStaticLabels(selectedPeriod);
        const dataMap = new Map();

        aggregatedData.forEach(entry => {
            let label = entry.label;
        
            if (selectedPeriod === "day") {
                label = `${label}:00`;
            } else if (selectedPeriod === "year") {
                // Converti "01" => "Jan", "02" => "Feb", ...
                const monthIndex = parseInt(label, 10) - 1;
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                label = monthNames[monthIndex] || label;
            }
            else if (selectedPeriod === "week") {
                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                label = dayNames[parseInt(label, 10)] || label;
            }            
        
            dataMap.set(label, Math.round(entry.total_minutes / 60 * 100) / 100); // minuti -> ore
        });
        

        const dataset = labels.map(label => dataMap.get(label) || 0);

    
        const chartData = {
            labels,
            datasets: [{
                label: "Hours Logged",
                data: dataset,
                backgroundColor: "#14c6c6"
            }]
        };
    
        const ctx = document.getElementById("reportsChart").getContext("2d");
        currentChart = new Chart(ctx, {
            type: "bar",
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: "top" }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: "Hours" }
                    },
                    x: {
                        title: {
                            display: true,
                            text:
                                selectedPeriod === "day" ? "Hour of Day" :
                                selectedPeriod === "week" ? "Day of Week" :
                                selectedPeriod === "month" ? "Day" : "Month"
                        },
                        ticks: {
                            autoSkip: false,
                            maxRotation: 90,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    async function handleExportReports() {
        const rawDate = dateInput?.airDatepicker?.selectedDates?.[0];
        const isoDate = toIsoDateString(rawDate);
    
        if (!selectedProjects.length || !isoDate || !selectedPeriod) {
            createToast("warning", "Export", "Please select at least one project and a date.");
            return;
        }
    
        const safePayload = {
            projectIds: selectedProjects.map(id => Number(id)),
            period: selectedPeriod,
            date: isoDate
        };
    
        const data = await window.electronAPI.getAggregatedTimeEntries(safePayload);
    
        if (!data || data.length === 0) {
            createToast("info", "Export", "No data to export.");
            return;
        }
    
        const formattedData = data.map(entry => ({
            label: entry.label,
            hours: (entry.total_minutes / 60).toFixed(2) + " h"
        }));
    
        // Ottieni il grafico come immagine base64
        const canvas = document.getElementById("reportsChart");
        const chartImage = canvas.toDataURL("image/png");
    
        const exportResult = await window.electronAPI.exportReportToPDF({
            date: isoDate,
            period: selectedPeriod,
            entries: formattedData,
            chartImage // passiamo il base64
        });
    
        if (exportResult?.success) {
            createToast("success", "Export", "Report exported successfully.");
        } else {
            createToast("error", "Export Error", exportResult?.message || "Failed to export PDF.");
        }
    }
    
        
     
}  