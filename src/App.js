import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AllProblems from "./views/AllProblems"
import CreateProblem from "./views/CreateProblem"
import MyProblems from "./views/MyProblems"
import ProblemDetail from "./views/ProblemDetail"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AllProblems />} />
        <Route path="/createProblem/:id" element={<CreateProblem />} />
        <Route path="/myProblems" element={<MyProblems />} />
        <Route path="/problemDetail/:id" element={<ProblemDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
