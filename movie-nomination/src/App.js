import './App.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Homepage from './Components/Homepage';

function App() {
  return (
    <div className="App">
      <Router>
        <Route path = '/' component = {Homepage}/>
      </Router>
    </div>
  );
}

export default App;
