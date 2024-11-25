import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SignIn from './components/SignIn.tsx';
import SignUp from './components/SignUp.tsx';
import MainRoom from '@/components/MainRoom.tsx';
import { SocketProvider } from '@/SocketProvider.tsx';
import PersonalRoom from '@/components/PersonalRoom.tsx';

function App() {
    return (
        <SocketProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<SignUp />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/main-room" element={<MainRoom />} />
                    <Route path="/room/:roomId" element={<PersonalRoom />} />
                </Routes>
            </BrowserRouter>
        </SocketProvider>
    );
}

export default App;
