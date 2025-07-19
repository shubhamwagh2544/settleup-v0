import { Header } from '@/components/Header.tsx';
import MainRoom from '@/components/MainRoom.tsx';
import PersonalAccount from '@/components/PersonalAccount.tsx';
import PersonalRoom from '@/components/PersonalRoom.tsx';
import RoomExpenses from '@/components/RoomExpenses.tsx';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import SignIn from './components/SignIn.tsx';
import SignUp from './components/SignUp.tsx';
import PersonalExpense from './components/PersonalExpense.tsx';
import UserProfile from '@/components/UserProfile.tsx';

function Layout() {
    const location = useLocation();
    const hideHeaderPaths = ['/', '/signin', '/signup'];
    const shouldShowHeader = !hideHeaderPaths.includes(location.pathname);

    return (
        <>
            {shouldShowHeader && <Header />}
            <Routes>
                <Route path="/" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/main-room" element={<MainRoom />} />
                <Route path="/room/:roomId" element={<PersonalRoom />} />
                <Route path="/room/:roomId/expenses" element={<RoomExpenses />} />
                <Route path="/account/:accountId" element={<PersonalAccount />} />
                <Route path="/room/:roomId/expenses/:expenseId" element={<PersonalExpense />} />
                <Route path="/profile/:userId" element={<UserProfile />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        // <SocketProvider>
        <BrowserRouter>
            <Layout />
        </BrowserRouter>
        // </SocketProvider>
    );
}

export default App;
