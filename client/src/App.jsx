import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useContext, useState, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router';
import { checkSession, doLogin, doLogout } from './api/auth.js';

import UserContext from './contexts/UserContext.jsx';
import NavBarLayout from './components/NavBarLayout.jsx';
import HomePage from './components/HomePage.jsx';
import LoginPage from './components/LoginPage.jsx';
import RankingPage from './components/RankingPage.jsx';
import GamePage from './components/GamePage.jsx';
import NotFoundPage from './components/NotFoundPage.jsx';

function App() {
    const navigate = useNavigate();

    // STATE AND HANDLERS RELATED TO CURRENTLY LOGGED USER

    // Currently logged user
    const [user, setUser] = useState({ id: undefined, username: undefined, name: undefined });
    const [logged, setLogged] = useState(false);
    const [loading, setLoading] = useState(true);

    // try to restore the login session
    useEffect(() => {
        checkSession().then(user => {
            if (user) {
                setUser({ id: user.id, username: user.username, name: user.name });
                setLogged(true);
            }
          }).catch(() => {
                setUser({ id: undefined, username: undefined, name: undefined });
                setLogged(false);
            }).finally(() => {
                setLoading(false);
            });
    }, []);

    // Login action handler
    const handleLogin = async (credentials) => {
        const user = await doLogin(credentials.username, credentials.password);
        setUser({ id: user.id, username: user.username, name: user.name });
        setLogged(true);
        navigate('/');
    };

    // Logout action handler
    const handleLogout = async () => {
        await doLogout();
        setUser({ id: undefined, username: undefined, name: undefined });
        setLogged(false);
        navigate('/');
    };

    if (loading) return null;

    return (
        <UserContext.Provider value={{ user }}>
            <Routes>
                {/* Routes with navbar */}
                <Route element={<NavBarLayout onLogout={handleLogout} />}>
                    <Route index element={<HomePage />} />
                    <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                    <Route path="/ranking" element={logged ? <RankingPage /> : <Navigate to="/" />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Game route — no navbar */}
                <Route path="/game" element={logged ? <GamePage /> : <Navigate to="/" />} />
            </Routes>
        </UserContext.Provider>
    );
}

export default App;
