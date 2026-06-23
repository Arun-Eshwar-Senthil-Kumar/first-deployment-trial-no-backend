// ============================================================
//  App.jsx — Task Manager App
//  Concepts used: useState, useEffect, components, props,
//  event handling, conditional rendering, array methods
//  NEW: localStorage persistence added
// ============================================================

import { useEffect, useState } from "react";
import "./App.css";

// ─── TaskItem Component ──────────────────────────────────────
// A separate, reusable component for a single task row.
// It receives data and functions from App via "props".
// Rule of thumb: if a piece of UI gets complex, extract it
// into its own component to keep the code readable.

function TaskItem({ task, onToggle, onDelete }) {
  return (
    // Add the "task-completed" CSS class when the task is done.
    // This is conditional rendering — we show a class only if a condition is true.
    <li className={`task-item ${task.completed ? "task-completed" : ""}`}>

      {/* Task text — CSS will apply line-through when completed */}
      <span className="task-text">{task.text}</span>

      <div className="task-actions">

        {/* ── Status Toggle Button ──────────────────────────────
            Clicking this calls the onToggle function (passed from App)
            with this task's id, so App knows which task to flip.    */}
        <button
          className={`status-btn ${task.completed ? "btn-completed" : "btn-pending"}`}
          onClick={() => onToggle(task.id)}
        >
          {task.completed ? "✔ Completed" : "⏳ Pending"}
        </button>

        {/* ── Delete Button ─────────────────────────────────────
            Calls onDelete with this task's id to remove it.        */}
        <button
          className="delete-btn"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
        >
          ✕
        </button>

      </div>
    </li>
  );
}

// ─── Default Sample Tasks ────────────────────────────────────
// Defined OUTSIDE the component so it is created only once,
// not on every re-render.
// Used as a fallback when localStorage has no saved data yet.
const DEFAULT_TASKS = [
  { id: 1, text: "Learn React useState hook",        completed: true  },
  { id: 2, text: "Understand props and components",  completed: false },
  { id: 3, text: "Build this To-Do app",             completed: false },
];

// ─── localStorage key ─────────────────────────────────────────
// A single constant for the key string so it never gets typo'd.
const STORAGE_KEY = "react-tasks";

// ─── App Component (Root) ────────────────────────────────────
// This is the main component. It:
//   • Holds all the data (state)
//   • Defines all the logic (functions)
//   • Passes data & functions down to child components as props

function App() {

  // ── STATE 1: The list of all tasks ───────────────────────────
  // Each task is an object with 3 fields:
  //   id        → a unique number to identify the task
  //   text      → the task name the user typed
  //   completed → true (done) or false (pending)
  //
  // ✨ NEW — Lazy Initialization:
  // Instead of passing a plain value, we pass an ARROW FUNCTION to useState.
  // React calls this function exactly once — on the very first render.
  // After that, React manages the state itself and ignores this function.
  // This is the correct way to read from localStorage at startup.
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY); // Read the raw string
    if (saved) {
      // localStorage stores everything as text.
      // JSON.parse() converts that text back into a JavaScript array.
      return JSON.parse(saved);
    }
    // Nothing saved yet → use the default sample tasks
    return DEFAULT_TASKS;
  });

  // ── STATE 2: What the user is typing in the input box ────────
  const [inputValue, setInputValue] = useState("");

  // ── STATE 3: Which filter tab is active ──────────────────────
  // Possible values: "all" | "pending" | "completed"
  const [filter, setFilter] = useState("all");

  // ✨ NEW — Auto-save to localStorage ─────────────────────────
  // useEffect runs AFTER every render where its dependency changed.
  // The dependency array [tasks] means: "run this effect whenever
  // the tasks array is updated."
  //
  // What happens step by step:
  //   1. User adds/deletes/toggles a task
  //   2. setTasks(...) updates the state
  //   3. React re-renders the component
  //   4. AFTER the render, this useEffect fires
  //   5. JSON.stringify turns the array into a text string
  //   6. localStorage.setItem saves that string in the browser
  //
  // localStorage.setItem(key, value) — saves the data
  // JSON.stringify(tasks)           — converts array → string
  //   e.g. [{id:1, text:"Buy milk", completed:false}]
  //        → '[{"id":1,"text":"Buy milk","completed":false}]'
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]); // ← dependency array: only re-run when tasks changes

  // ────────────────────────────────────────────────────────────
  //  FUNCTIONS (Event Handlers)
  // ────────────────────────────────────────────────────────────

  // ── ADD TASK ─────────────────────────────────────────────────
  // Creates a new task object and adds it to the tasks array.
  const handleAddTask = () => {
    // .trim() removes whitespace from both ends of the string.
    // This prevents adding tasks like "   " (just spaces).
    if (inputValue.trim() === "") return; // Guard clause — exit early if empty

    const newTask = {
      id: Date.now(), // Date.now() returns a unique timestamp number, perfect for IDs
      text: inputValue.trim(),
      completed: false, // All new tasks start as Pending
    };

    // IMPORTANT: Never mutate state directly (don't do tasks.push(...))
    // Always create a NEW array with the spread operator (...tasks).
    // React detects the new array reference and re-renders the UI.
    setTasks([...tasks, newTask]);

    setInputValue(""); // Clear the input box
  };

  // ── TOGGLE TASK STATUS ───────────────────────────────────────
  // Flips a task's completed field between true and false.
  const handleToggle = (id) => {
    // .map() creates a NEW array by transforming each element.
    // We find the task whose id matches, then flip its completed field.
    // All other tasks are returned unchanged.
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, completed: !task.completed }; // flip it
      }
      return task; // leave it as-is
    });

    setTasks(updatedTasks);
  };

  // ── DELETE TASK ──────────────────────────────────────────────
  // Removes a task from the array by filtering it out.
  const handleDelete = (id) => {
    // .filter() creates a NEW array keeping only elements that pass the test.
    // Here we keep everything EXCEPT the task with the matching id.
    const remainingTasks = tasks.filter((task) => task.id !== id);
    setTasks(remainingTasks);
  };

  // ── CLEAR ALL COMPLETED TASKS ────────────────────────────────
  // Keeps only tasks that are NOT completed (pending tasks).
  const handleClearCompleted = () => {
    const activeTasks = tasks.filter((task) => !task.completed);
    setTasks(activeTasks);
  };

  // ── HANDLE ENTER KEY IN INPUT ────────────────────────────────
  // So the user doesn't have to click the button — they can press Enter.
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };


  // ────────────────────────────────────────────────────────────
  //  DERIVED VALUES (computed from state, not stored in state)
  // ────────────────────────────────────────────────────────────

  // Count tasks using .filter() and .length
  const totalCount     = tasks.length;
  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount   = totalCount - completedCount;

  // Decide which tasks to display based on the active filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending")   return !task.completed; // only pending
    if (filter === "completed") return task.completed;  // only completed
    return true;                                        // "all" — show everything
  });


  // ────────────────────────────────────────────────────────────
  //  JSX — What gets rendered to the screen
  // ────────────────────────────────────────────────────────────
  return (
    <div className="app-container">

      {/* ── Title ─────────────────────────────────────────────── */}
      <h1 className="app-title">
        <span className="title-icon">📋</span> Task Manager
      </h1>

      {/* ── Counters ──────────────────────────────────────────── */}
      {/* These display live counts derived from the tasks array  */}
      <div className="counters">
        <div className="counter-card counter-total">
          <span className="counter-number">{totalCount}</span>
          <span className="counter-label">Total</span>
        </div>
        <div className="counter-card counter-pending">
          <span className="counter-number">{pendingCount}</span>
          <span className="counter-label">Pending</span>
        </div>
        <div className="counter-card counter-done">
          <span className="counter-number">{completedCount}</span>
          <span className="counter-label">Completed</span>
        </div>
      </div>

      {/* ── Input Section ─────────────────────────────────────── */}
      <div className="input-section">
        <input
          type="text"
          className="task-input"
          placeholder="What needs to be done?"
          value={inputValue}
          // onChange fires on every keystroke, syncing the input to state
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={120}
        />
        <button className="add-btn" onClick={handleAddTask}>
          + Add
        </button>
      </div>

      {/* ── Filter Tabs ───────────────────────────────────────── */}
      {/* The active filter button gets the "active" CSS class     */}
      <div className="filter-section">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All <span className="filter-count">{totalCount}</span>
        </button>
        <button
          className={`filter-btn ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending <span className="filter-count">{pendingCount}</span>
        </button>
        <button
          className={`filter-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Done <span className="filter-count">{completedCount}</span>
        </button>
      </div>

      {/* ── Task List ─────────────────────────────────────────── */}
      <ul className="task-list">
        {/* Conditional rendering: show a message when list is empty */}
        {filteredTasks.length === 0 ? (
          <li className="empty-state">
            {filter === "completed" && "No completed tasks yet. Keep going! 💪"}
            {filter === "pending"   && "All done! Nothing pending. 🎉"}
            {filter === "all"       && "No tasks yet — add one above! ✨"}
          </li>
        ) : (
          // .map() turns each task object into a TaskItem component.
          // "key" is required by React so it can track list items efficiently.
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}         // pass the whole task object as a prop
              onToggle={handleToggle}  // pass the toggle function as a prop
              onDelete={handleDelete}  // pass the delete function as a prop
            />
          ))
        )}
      </ul>

      {/* ── Footer: Clear Completed Button ────────────────────── */}
      {/* Only renders when there is at least one completed task   */}
      {completedCount > 0 && (
        <div className="footer">
          <button className="clear-btn" onClick={handleClearCompleted}>
            🗑 Clear {completedCount} Completed
          </button>
        </div>
      )}

    </div>
  );
}

export default App;