package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	_ "github.com/lib/pq"
)

var db *sql.DB

func init() {
	connStr := "host=pg-37d27cf3-gocrudffff.b.aivencloud.com user=avnadmin password=AVNS_NzwxDhqUBLgMAO3EPhE dbname=defaultdb port=10146 sslmode=require"
	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		panic(err)
	}
}

func storeCaptions(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var data struct{ Caption string }
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	fmt.Println("data", data)
	timestamp := time.Now()
	_, err = db.Exec("INSERT INTO captions (text, timestamp) VALUES ($1, $2)", data.Caption, timestamp)
	if err != nil {
		fmt.Println("error", err)
		http.Error(w, "Failed to save", http.StatusInternalServerError)
		return
	}

	fmt.Fprintln(w, `{"status": "saved"}`)
}

func getTranscription(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT text, timestamp FROM captions ORDER BY timestamp")
	if err != nil {
		http.Error(w, "Failed to fetch transcription", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var transcriptions []map[string]string
	for rows.Next() {
		var text string
		var timestamp time.Time
		rows.Scan(&text, &timestamp)
		transcriptions = append(transcriptions, map[string]string{"text": text, "timestamp": timestamp.Format(time.RFC3339)})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transcriptions)
}

func main() {
	http.HandleFunc("/storecaptions", storeCaptions)
	http.HandleFunc("/gettranscription", getTranscription)
	http.ListenAndServe(":8080", nil)
}
