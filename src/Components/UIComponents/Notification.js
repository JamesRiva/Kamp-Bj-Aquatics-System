import React, { useEffect, useState } from 'react';
import '../Styles/Notification.css';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        // Get the userId from localStorage
        const userId = localStorage.getItem('userId');
        if (userId) {
            // Fetch notifications from the backend
            fetch(`${apiUrl}/KampBJ-api/server/fetchNotifs.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log(data.notifications);
                    setNotifications(data.notifications);
                } else {
                    console.error('No notifications found:', data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching notifications:', error);
            });
        }
    }, []);

    const getTimeAgo = (timestamp) => {
        const currentTime = new Date();
        const timeReceived = new Date(timestamp);
        const timeDifference = Math.floor((currentTime - timeReceived) / 1000); // in seconds

        if (timeDifference < 60) {
            return `${timeDifference} seconds ago`;
        } else if (timeDifference < 3600) {
            const minutes = Math.floor(timeDifference / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (timeDifference < 86400) {
            const hours = Math.floor(timeDifference / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(timeDifference / 86400);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        }
    };

    return (
        <div className='notification'>
            <div className='notification__body'>
                <table className='notification__table'>
                    <tbody>
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <tr key={notification.notifId} className='notification__tr'>
                                    <td className='notification__td'>
                                        {notification.message}
                                        <br />
                                        <span>{getTimeAgo(notification.timeReceived)}</span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className='notification__td'>No notifications available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Notification;
