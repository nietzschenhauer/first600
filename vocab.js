let vokabelSpeicher = []; // Speicher für die geladenen Vokabeln
let quiz = null; // Wird erst nach dem Laden der Vokabeln initialisiert
let ersterKey, zweiterKey, dritterKey;


// Funktion zum Laden einer JSON-Datei
function ladeJson(dateiName) {
    fetch(dateiName)
        .then((response) => {
            if (!response.ok) throw new Error(`Fehler beim Laden von ${dateiName}: ${response.status}`);
            return response.json(); // JSON-Daten parsen
        })
        .then((data) => {
            vokabelSpeicher = data; // Speichert die geladenen Daten im Arbeitsspeicher
            console.log(`Vokabeln aus ${dateiName} geladen:`, data);
            quiz = new VokabelIterator(vokabelSpeicher); // Initialisiere den Iterator mit den geladenen Daten
            analyzeObject(data)
            frageElement.textContent = `Neue Vokabeln aus "${dateiName}" geladen. Drücke "Start", um zu beginnen.`;
            antwortElement.style.display = "none"; // Eingabefeld ausblenden
            toggleButtons(false)
            
            startButton.style.display = "block"; // Start-Button anzeigen
            
        })
        .catch((error) => {
            console.error('Fehler beim Laden der Vokabeln:', error);
        });
}
function analyzeObject(vS){
    const firstArray = [...vS];
    const firstLine = firstArray[0];

    ersterKey = Object.keys(firstLine)[0];
    zweiterKey = Object.keys(firstLine)[1];
    dritterKey = Object.keys(firstLine)[2];

    //${aktuelleVokabel[ersterKey]}
}

// JSON-Datei laden
ladeJson('meinen.json');

// HTML-Elemente referenzieren
const frageElement = document.getElementById("frage");
const antwortElement = document.getElementById("antwort");
const startButton = document.getElementById("startButton");
const weiterButton = document.getElementById("weiterButton");
const historyList = document.getElementById("history");
// Initialisiere den Iterator
let aktuelleVokabel = null;


// Funktion: Verlaufseintrag hinzufügen
function addToHistory(message) {
    const listItem = document.createElement("li");
    listItem.textContent = message;
    historyList.appendChild(listItem);
}

// Iterator für die Vokabeln
// function* vokabelIterator(vokabelListe) {
//     for (const vokabel of vokabelListe) {
//         yield vokabel;
//     }
// }

class VokabelIterator {
    constructor(vocabulary) {
        this.pool = [...vocabulary]; // Kopie der ursprünglichen Liste
        this.faulty = []; // Falsch beantwortete Fragen
    }

    // Liefert die nächste Frage aus dem Pool
    next() {
        if (this.pool.length === 0 && this.faulty.length === 0) {
            return { value: null, done: true }; // Kein weiterer Inhalt
        }

        // Wenn der Pool leer ist, die fehlerhaften Vokabeln zurück in den Pool laden
        if (this.pool.length === 0 && this.faulty.length > 0) {
            this.pool = [...this.faulty];
            this.faulty = [];
            this.shuffle(this.pool);
        }

        return { value: this.pool.shift(), done: false }; // Erste Vokabel aus dem Pool zurückgeben
    }

    // Fügt eine Vokabel in die faulty-Liste ein
    addBack(vocab) {
        this.faulty.push(vocab);
    }

    // Shuffle-Funktion für Abwechslung
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}


// Funktion: Nächste Frage anzeigen
function naechsteFrage() {
    const ergebnis = quiz.next();

    if (!ergebnis.done) {
        aktuelleVokabel = ergebnis.value;

        frageElement.textContent = `Was bedeutet "${aktuelleVokabel[zweiterKey]}"?`;
        antwortElement.value = ""; // Eingabefeld leeren
        antwortElement.style.display = "block"; // Eingabefeld anzeigen
        toggleButtons(true); // Weiter-Button anzeigen
    } else {
        frageElement.textContent = "Das waren alle Fragen! Vielen Dank.";
        antwortElement.style.display = "none"; // Eingabefeld ausblenden
        toggleButtons(false); 

    }
}
function handleWeiter() {
    const antwort = antwortElement.value;
    if (antwort) {
        if (antwort === aktuelleVokabel[ersterKey]) {
            frageElement.innerText = `Richtig!`;
            addToHistory(`✅ ${aktuelleVokabel[zweiterKey]} -> ${antwort} (richtig)  `);
        } else {
            frageElement.innerText = `Falsch! Die richtige Antwort ist: ${aktuelleVokabel[zweiterKey]}`;
            addToHistory(`❌ ${aktuelleVokabel[zweiterKey]} -> ${antwort} (falsch)- ${aktuelleVokabel[ersterKey]}`);
            quiz.addBack(aktuelleVokabel);
        }

        naechsteFrage(); // Nächste Frage anzeigen
    } else {
        alert("Bitte gib eine Antwort ein!");
    }
}
function toggleButtons(show) {
    const greenButton = document.getElementById("greenButton");
    const redButton = document.getElementById("redButton");
    const weiterButton = document.getElementById("weiterButton");

    if (show) {
        greenButton.style.display = "inline-block";
        redButton.style.display = "inline-block";
        weiterButton.style.display = "inline-block";
    } else {
        greenButton.style.display = "none";
        redButton.style.display = "none";
        weiterButton.style.display = "none";
    }
}

// Start-Button Event Listener
startButton.addEventListener("click", () => {
    startButton.style.display = "none"; // Start-Button ausblenden
    naechsteFrage(); // Erste Frage starten
});

antwortElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Verhindert, dass ein Formular abgeschickt wird (falls vorhanden)
        handleWeiter(); // Ruft die gleiche Funktion wie der Button-Click auf
    }

// Weiter-Button Event Listener
weiterButton.addEventListener("click", handleWeiter);
});
greenButton.addEventListener("click", () => {
    frageElement.innerText = `Richtig!`;
    addToHistory(`✅ ${aktuelleVokabel[zweiterKey]} -> ${aktuelleVokabel[ersterKey]} (richtig)  `);
    naechsteFrage();
});
redButton.addEventListener("click", () => {
    frageElement.innerText = `Falsch! Die richtige Antwort ist: ${aktuelleVokabel[zweiterKey]}`;
    addToHistory(`❌ ${aktuelleVokabel[zweiterKey]} (falsch)- ${aktuelleVokabel[ersterKey]}`);
    quiz.addBack(aktuelleVokabel);
    naechsteFrage();
});