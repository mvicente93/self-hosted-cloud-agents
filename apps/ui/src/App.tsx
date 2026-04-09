import type { Component } from 'solid-js';
import Sidebar from './components/Sidebar';
import StartNewChat from './components/StartNewChat';

const App: Component = () => {
  return (
    <Sidebar>
      <StartNewChat />
    </Sidebar>
  );
};

export default App;
