import { Outlet } from 'react-router';
import NavBar from './NavBar.jsx';

function NavBarLayout({ onLogout }) {
    return (
        <>
            <NavBar onLogout={onLogout} />
            <Outlet />
        </>
    );
}

export default NavBarLayout;
