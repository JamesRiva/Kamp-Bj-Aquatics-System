import React from 'react';
import '../Styles/DashboardCards.css';

const DashboardCards = ({customCardsClass, title, subTitle, desription}) => {
  return (
    <div className={`dashboard-cards ${customCardsClass}`}>
        <div className='dashboard-cards__header'>
            <div className='dashboard-cards__title-wrapper'>
                <p className='dashboard-cards__card-title'>{title}</p>
                <p className='dashboard-cards__card-sub-title'>{subTitle}</p>
            </div>
            <div className='dashboard-cards__icon-wrapper'>
                <i className="dashboard-cards__icon fa-solid fa-dollar-sign"></i>
            </div>
        </div>
        <p className='dashboard-cards__card-description'>{desription}</p>
    </div>
  )
}

export default DashboardCards
