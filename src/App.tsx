import React from "react";
import logo from "./logo.svg";
import "./App.css";
import MyEditor from "./components/Editor";

function App() {
  return (
    <div>
      <h1>Draft.js Autocomplete Editor</h1>
      <h4>Use Autocomplete by typing <code>{'<>'}</code></h4>
      <MyEditor />
    </div>
  );
}

export default App;
