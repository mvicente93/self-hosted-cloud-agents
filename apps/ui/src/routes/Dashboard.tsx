import type { Component } from "solid-js";
import Sidebar from "../components/Sidebar";
import AgentInterface from "../components/AgentInterface";

const Dashboard: Component = () => {
  return (
    <div class="flex h-screen bg-[var(--terminal-bg)]">
      <Sidebar />
      <AgentInterface />
    </div>
  );
};

export default Dashboard;