import React from 'react';
import '../Styles/modal.css';
import ButtonComponent from './ButtonComponent';

const ActionMessage = () => {
  return (
    <div className='modal'>
      <div className='modal__wrapper'>
        <div className='action-message__wrapper'></div>
        <div className='action-message__control-wrappers'>
            <ButtonComponent label='Confirm' />
            <ButtonComponent label='Cancel' />
        </div>
      </div>
    </div>
  )
}

export default ActionMessage
