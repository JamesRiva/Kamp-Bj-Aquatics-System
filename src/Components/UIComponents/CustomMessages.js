import React from 'react';
import '../Styles/CustomMessages.css';

export const GoodMessage = ({message}) => {
    return (
        <div className='custom-messages__wrapper good-message'>
            <p className='custom-messages__status good-message'>Great Business !</p>

            <p
                className="custom-message__message"
                dangerouslySetInnerHTML={{ __html: message }}
            />
        </div>
    )
}

export const WarningMessage = ({message}) => {
    return (
        <div className='custom-messages__wrapper warning-message'>
            <p className='custom-messages__status warning-message'>Warning !</p>

            <p
                className="custom-message__message"
                dangerouslySetInnerHTML={{ __html: message }}
            />
        </div>
    )
}
