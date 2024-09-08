import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SignIn from './components/SignIn.tsx';
import SignUp from './components/SignUp.tsx';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/signup" element={<SignIn />} />
                <Route path="/signin" element={<SignUp />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
