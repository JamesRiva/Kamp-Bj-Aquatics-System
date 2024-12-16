import React, { useEffect, useState } from 'react';
import '../Styles/GeneralLedger.css';
import { ToastSuccess, ToastError } from '../UIComponents/ToastComponent';
import GeneratePdf from '../UIComponents/GeneratePdf';
import LoadingState from '../UIComponents/LoadingState';
import ButtonComponent from '../UIComponents/ButtonComponent';
import GeneralLedgerEnterCapital from '../UIComponents/GeneralLedgerEnterCapital';
import LedgerGraphView from '../UIComponents/LedgerGraphView';

const GeneralLedger = () => {
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const [ledgerData, setLedgerData] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Intl.DateTimeFormat('default', { year: 'numeric' }).format(new Date()));
  const [ledgerModal, setLedgerModal] = useState(false);
  const [ledgerGraphView, setLedgerGraphView] = useState(false);

  

  useEffect(() => {
    getSalesAndExpenses();
  }, [])

  const getSalesAndExpenses = async() => {
    setLoading(true);

    // Fetch data from the PHP script with the selectedYear and capitalInput
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getSalesAndExpenses.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currYear: currentYear, endYear: '2022' }),
    })
      .then(response => response.json())
      .then(data => {
        setLedgerData(data);
      })
      .catch(error => {
        ToastError('Error fetching data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  

  const formatCurrency = (currency) => {
    // Ensure debit is a valid number before applying formatting
    const numericCurrency = parseFloat(currency);
  
    // Format the number first, then apply toFixed for decimal places
    const formattedCurrency = numericCurrency.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `₱ ${formattedCurrency}`;
  };

  //Keep it here just in case
  const formatDate = (date) => {
    const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [year, month] = date.split('-');

    const translateMonth = months[parseInt(month, 10) - 1];

    return `${year} - ${translateMonth}`;
  }

  return (
    <div className='general-ledger'>
      <div className='general-ledger__header'>

        <div className='general-ledger__controls'>
          <div className='general-ledger__input-field-wrapper'>
            <p className='general-ledger__display-date'>2023 - {currentYear}</p>
          </div>
          <div className='general-ledger__right-controls'>
            <ButtonComponent label='+' onClick={() => setLedgerModal(true)}/>
            <ButtonComponent label={<i className="fa-solid fa-eye"></i>} onClick={() => setLedgerGraphView(true)}/> 
          </div>
        </div>        
      </div>

      <div className='general-ledger__body'>
        <div className='general-ledger__table-wrapper'>
          <table className='general-ledger__table' id='general-ledger-table'>
            <thead>
              <tr>
                <th className='general-ledger__table-th'>Month</th>
                <th className='general-ledger__table-th'>Account</th>
                <th className='general-ledger__table-th'>Description</th>
                <th className='general-ledger__table-th'>Debit</th>
                <th className='general-ledger__table-th'>Credit</th>
                <th className='general-ledger__table-th'>Balance</th>
              </tr>
            </thead>
            <tbody>
              {
                ledgerData.map((item, index) => (
                  <tr className='inventory__table-tr' key={index}>
                      <td className='inventory__table-td'>{item.Month}</td>
                      <td className='inventory__table-td'>{item.Account}</td>
                      <td className='inventory__table-td'>{item.Description}</td>
                      <td className='inventory__table-td'>{formatCurrency((item.Debit * 1).toFixed(2))}</td>
                      <td className='inventory__table-td'>{formatCurrency((item.Credit * 1).toFixed(2))}</td>
                      <td className='inventory__table-td'>{formatCurrency((item.Balance * 1).toFixed(2))}</td>
                    </tr>
                ))
              }   
            </tbody>
          </table>
        </div>
      </div>
      
      {ledgerGraphView && <LedgerGraphView onClick={() => setLedgerGraphView(false)} ledgerData={ledgerData} />}
      {ledgerModal && <GeneralLedgerEnterCapital onClick={() => setLedgerModal(false)} fetchSalesAndExpenses={getSalesAndExpenses} />}
      {loading && <LoadingState />}
    </div>
  );
};

export default GeneralLedger;
