import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useContext, useState, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router';
import { checkSession, doLogin, doLogout } from './api/auth.js';

import UserContext from './contexts/UserContext.jsx';
import NavBarLayout from './components/NavBarLayout.jsx';
import HomePage from './components/HomePage.jsx';
import NotFoundPage from './components/NotFoundPage.jsx';

function App() {
    const navigate = useNavigate();

    // STATE AND HANDLERS RELATED TO CURRENTLY LOGGED USER

    // Currently logged user
    const [user, setUser] = useState({ id: undefined, username: undefined, name: undefined });
    const [logged, setLogged] = useState(false);

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

    return (
        <UserContext.Provider value={{ user, logged }}>
            <Routes>
                {/* Routes with navbar */}
                <Route element={<NavBarLayout onLogout={handleLogout} />}>
                    <Route index element={<HomePage />} />
                    <Route path="/login" element={<div className="p-5">Login page (TODO)</div>} />
                    <Route path="/ranking" element={logged ? <div className="p-5">Ranking page (TODO)</div> : <Navigate to="/" />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Game route — no navbar */}
                <Route path="/game" element={logged ? <div className="p-5">Game page (TODO)</div> : <Navigate to="/" />} />
            </Routes>
        </UserContext.Provider>
    );
}

export default App;
