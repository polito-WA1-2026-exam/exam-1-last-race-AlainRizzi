import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useContext, useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router';
import { checkSession, doLogin, doLogout } from './api/auth.js';

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
          }).catch(err => {
                setUser({ id: undefined, username: undefined, name: undefined });
                setLogged(false);
            });
    }, []);

    // Login action handler
    const handleLogin = async (newUser) => {
        const user = await doLogin(newUser.username, newUser.password);
        setUser({ id: user.id, username: user.username, name: user.name });
        setLogged(true);
        navigate('/');
    }

    // Logout action handler
    const handleLogout = async () => {
        await doLogout();
        setUser({ id: undefined, username: undefined, name: undefined });
        setLogged(false);
        navigate('/');
    };
};

export default App;