import React, {useEffect} from 'react'
import MainLayout from '../../layouts/MainLayout'
import { useNavigate, NavLink } from 'react-router-dom'
import { checkSession } from '../../services/authService'

const NotFound = () => {

    const navigate = useNavigate();
    useEffect(() => {
        (async () => {
          const isValid = await checkSession();
          if (!isValid) navigate('/');
        })();
      }, [navigate]);

    return (
        <MainLayout>
            <div className='center-content'>
                <h1>404 - Page Not Found</h1>
                <p>The page you are looking for does not exist.</p>
            </div>
        </MainLayout>
    )
}

export default NotFound
