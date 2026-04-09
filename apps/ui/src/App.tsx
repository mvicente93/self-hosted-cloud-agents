import { Component } from "solid-js";
import { Router, Route } from "@solidjs/router";
import Homepage from "./routes/Homepage";
import Dashboard from "./routes/Dashboard";

const App: Component = () => {
  return (
    <Router>
      <Route path="/" component={Homepage} />
      <Route path="/dashboard" component={Dashboard} />
    </Router>
  );
};

export default App;