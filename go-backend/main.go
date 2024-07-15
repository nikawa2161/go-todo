package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type Todo struct {
    ID     string `json:"id"`
    Title  string `json:"title"`
    Status string `json:"status"`
}

var (
    todos  = []Todo{}
    mu     sync.Mutex
    nextID = 1
)

func main() {
    r := mux.NewRouter()
    r.HandleFunc("/api/todos", getTodos).Methods("GET")
    r.HandleFunc("/api/todos", createTodo).Methods("POST")
    r.HandleFunc("/api/todos/{id}", updateTodo).Methods("PUT")
    r.HandleFunc("/api/todos/{id}", deleteTodo).Methods("DELETE")

    handler := cors.AllowAll().Handler(r)
    
    log.Println("Server started at :8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}

func getTodos(w http.ResponseWriter, r *http.Request) {
    mu.Lock()
    defer mu.Unlock()
    json.NewEncoder(w).Encode(todos)
}

func createTodo(w http.ResponseWriter, r *http.Request) {
    mu.Lock()
    defer mu.Unlock()
    var todo Todo
    json.NewDecoder(r.Body).Decode(&todo)
    todo.ID = fmt.Sprintf("%d", nextID)
    nextID++
    todos = append(todos, todo)
    json.NewEncoder(w).Encode(todo)
}

func updateTodo(w http.ResponseWriter, r *http.Request) {
    mu.Lock()
    defer mu.Unlock()
    params := mux.Vars(r)
    id := params["id"]
    var updatedTodo Todo
    json.NewDecoder(r.Body).Decode(&updatedTodo)
    for i, todo := range todos {
        if todo.ID == id {
            todos[i] = updatedTodo
            todos[i].ID = id
            json.NewEncoder(w).Encode(todos[i])
            return
        }
    }
    http.NotFound(w, r)
}

func deleteTodo(w http.ResponseWriter, r *http.Request) {
    mu.Lock()
    defer mu.Unlock()
    params := mux.Vars(r)
    id := params["id"]
    for i, todo := range todos {
        if todo.ID == id {
            todos = append(todos[:i], todos[i+1:]...)
            w.WriteHeader(http.StatusNoContent)
            return
        }
    }
    http.NotFound(w, r)
}
