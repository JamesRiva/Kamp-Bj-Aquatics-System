import React, { useEffect, useState } from 'react';
import '../Styles/GeneralLedger.css';
import { YearSelection } from '../UIComponents/DateControls';
import html2pdf from 'html2pdf.js';
import { ToastSuccess, ToastError } from '../UIComponents/ToastComponent';

const GeneralLedger = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [ledgerData, setLedgerData] = useState([]);
  const [capitalInput, setCapitalInput] = useState(0);  // Default capital is 0
  const [selectedYear, setSelectedYear] = useState(new Intl.DateTimeFormat('default', { year: 'numeric' }).format(new Date()));

  const handleYearChange = (selectedYear) => {
    setSelectedYear(new Intl.DateTimeFormat('default', { year: 'numeric' }).format(selectedYear));

    getSalesAndExpenses(selectedYear);
  };

  const getSalesAndExpenses = (year) => {
    // Fetch data from the PHP script with the selectedYear and capitalInput
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getSalesAndExpenses.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedYear: year, capital: capitalInput }), // Send capital in request body
    })
      .then(response => response.json())
      .then(data => {
        setLedgerData(data);
      })
      .catch(error => {
        ToastError('Error fetching data:', error);
      });
  };

  const handleInputCapitalChange = (e) => {
    const convertToFloat = e.target.value ? parseFloat(e.target.value) : 0;
    setCapitalInput(convertToFloat);
  };

  const handleCapitalSubmit = () => {
    if (isNaN(capitalInput) || capitalInput <= 0) {
      ToastError('Please Enter A Valid Capital Amount');
    } else {
      ToastSuccess('Capital Added');
      getSalesAndExpenses();
    }
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

  const handleDownloadPDF = async () => {
    const table = document.getElementById('general-ledger-table'); // Get the table element
    const tableWidth = table.offsetWidth;  // Get the table's current width
    const pageWidth = 210;  // A4 page width in mm (for landscape, it’s 297mm)

    // Calculate the scale factor to fit the table width to the PDF page width
    const scale = pageWidth / tableWidth;

    const options = {
      filename: 'General_Ledger.pdf',  // Optional: specify the filename for the PDF
      margin: 10,  // Set margins for the PDF (top, left, bottom, right)
      html2canvas: {
        scale: 2,  // Automatically scale to fit the width
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'landscape',  // Set the PDF orientation to landscape for wide tables
      },
    };

    // Generate and save the PDF
    html2pdf().from(table).set(options).save();
  };

  return (
    <div className='general-ledger'>
      <div className='general-ledger__header'>
        <div className='general-ledger__controls'>
          <div className='general-ledger__input-field-wrapper'>
            <input
              type='number'
              placeholder='Enter Capital'
              className='general-ledger__input-field'
              onChange={handleInputCapitalChange}
              step="0.01"
            />
            <i className="general-ledger__input-icon fa-solid fa-right-to-bracket" title='Insert Capital' onClick={handleCapitalSubmit}></i>
          </div>
          <i className="general-ledger__download-pdf-icon fa-solid fa-file-arrow-down" title='Download General Ledger' onClick={handleDownloadPDF}></i>
        </div>
        <YearSelection onChange={handleYearChange} displayDate={selectedYear} />
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
                capitalInput <= 0 ? (
                  <tr>
                    <td>Please Enter Capital First</td>
                  </tr>
                ) :
                (
                  ledgerData.length > 0 ? ledgerData.map((ledgerItem, index) => (
                    <tr className='inventory__table-tr' key={index}>
                      <td className='inventory__table-td'>{ledgerItem.Month}</td>
                      <td className='inventory__table-td'>{ledgerItem.Account}</td>
                      <td className='inventory__table-td'>{ledgerItem.Description}</td>
                      <td className='inventory__table-td'>{formatCurrency((ledgerItem.Debit * 1).toFixed(2))}</td>
                      <td className='inventory__table-td'>{formatCurrency((ledgerItem.Credit * 1).toFixed(2))}</td>
                      <td className='inventory__table-td'>{formatCurrency((ledgerItem.Balance * 1).toFixed(2))}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6">Please select year and enter a Capital Amount</td>
                    </tr>
                  )
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GeneralLedger;
