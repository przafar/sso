import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CallBack from './Callback';
import Home from './Home';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="auth/callback" element={<CallBack />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;