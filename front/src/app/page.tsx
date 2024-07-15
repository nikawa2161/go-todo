"use client";

import { useState, useEffect } from "react";

type Todo = {
  id: string;
  title: string;
  status: string;
};

const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todos`)
      .then((response) => response.json())
      .then((data) => setTodos(data))
      .catch((error) => console.error('Error fetching todos:', error));
  }, []);

  const addTodo = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: newTodo, status: "pending" }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTodos((prevTodos) => [...prevTodos, data]);
        setNewTodo("");
      })
      .catch((error) => console.error('Error adding todo:', error));
  };

  const updateTodo = (id: string, status: string) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTodos((prevTodos) =>
          prevTodos.map((todo) => (todo.id === id ? data : todo))
        );
      })
      .catch((error) => console.error('Error updating todo:', error));
  };

  const deleteTodo = (id: string) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todos/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      })
      .catch((error) => console.error('Error deleting todo:', error));
  };

  return (
    <div>
      <h1>TODO App</h1>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="New TODO"
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.title} - {todo.status}
            <button
              onClick={() =>
                updateTodo(
                  todo.id,
                  todo.status === "pending" ? "done" : "pending"
                )
              }
            >
              Toggle Status
            </button>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoApp;
