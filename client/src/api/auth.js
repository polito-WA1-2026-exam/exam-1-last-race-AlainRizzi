async function doLogin(username, password){
    const response = await fetch('http://localhost:3001/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username: username, 
            password: password 
        }),
        credentials: 'include'
    });

    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
    }
}

async function doLogout() {
    const response = await fetch('http://localhost:3001/api/sessions/current', {
        method: 'DELETE',
        credentials: 'include'
    });

    if (response.ok) {
        return true;
    } else {
        const error = await response.json();
        throw new Error(error.error || 'Logout failed');
    }
}

async function checkSession() {
    const response = await fetch('http://localhost:3001/api/sessions/current', {
        credentials: 'include'
    });

    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        return null;
    }
}

export { doLogin, doLogout, checkSession };