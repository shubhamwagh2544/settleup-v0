import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SignIn from './components/SignIn/SignIn.tsx';
import SignUp from './components/SignUp.tsx';
import MainRoom from '@/components/MainRoom.tsx';
import { SocketProvider } from '@/SocketProvider.tsx';
import PersonalRoom from '@/components/PersonalRoom.tsx';
import RoomExpenses from '@/components/RoomExpenses.tsx';
import LandingPage from './components/Landing/LandingPage.tsx';

function App() {
    return (
        <SocketProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/main-room" element={<MainRoom />} />
                    <Route path="/room/:roomId" element={<PersonalRoom />} />
                    <Route path="/room/:roomId/expenses" element={<RoomExpenses />} />
                </Routes>
            </BrowserRouter>
        </SocketProvider>
    );
}

export default App;
