import React, { useState, useEffect } from 'react';
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from 'recharts';
import '../Styles/LedgerGraphView.css';
import { GoodMessage, WarningMessage } from './CustomMessages';
import { CustomToolTipForLedgerGraph } from './CustomToolTip';

const LedgerGraphView = ({onClick, ledgerData}) => {
  const defaultDate = useState(new Date().toLocaleDateString('default', { month:'numeric', year:'numeric' }))
  const [structuredData, setStructuredData] = useState([]);
  const [balanceTrend, setBalanceTrend] = useState('');
  const [percentage, setPercentage] = useState();

  const formatDate = () => {
    const splittedDate = defaultDate[0].split('/');
    const month = splittedDate[0].padStart(2, '0'); 
    const year = splittedDate[1];
    
    return `${year}-${month}`
  }
  
  //This is needed for dynamic date range to get the necessary data, for now disregard this, since it was just dummy data.
  const subtractMonths = () => {
    const currDate = formatDate();
    const [year, month] = currDate.split('-');
    const subtractedDate = new Date(year, month);
    subtractedDate.setMonth(subtractedDate.getMonth() - 3);

    const newYear = subtractedDate.getFullYear();
    const newMonth = subtractedDate.getMonth().toString().padStart(2, '0');
    
    const newDate = `${newYear}-${newMonth}`;
    return `${newDate} - ${currDate}`;
  }

  useEffect(() => {
    groupLedgerData();
  }, []);

  const groupLedgerData = () => {
    //Destructure once again
    const [startDate, endDate] = subtractMonths().split(' - ');
    
    const filterDataWithDate = ledgerData.filter(data => {
      const dataDate = data.Month;

      return dataDate >= startDate && dataDate <= endDate;
    })

     // Group the filtered data by month and accumulate totals
    const groupedData = filterDataWithDate.reduce((acc, curr) => {
      // Find if the month already exists in the accumulator
      const existingMonth = acc.find(item => item.Month === curr.Month);

      if (existingMonth) {
        // Add to existing month's totals
        existingMonth.TotalDebit += curr.Debit;
        existingMonth.TotalCredit += curr.Credit;
        existingMonth.Balance = curr.Balance; // Use the last balance for the month
      } else {
        // Create a new entry for the month if it doesn't exist
        acc.push({
          Month: curr.Month,
          TotalDebit: curr.Debit,
          TotalCredit: curr.Credit,
          Balance: curr.Balance,
        });
      }

      return acc; // Return the accumulator at the end of each iteration
    }, []); // Initialize accumulator as an empty array
    
    setStructuredData(groupedData);

    // Calculate overall percentage change based on first and previous balance
    const currBalance = groupedData[groupedData.length - 1];
    const prevBalance = groupedData[groupedData.length - 2];

    if (currBalance && prevBalance) {
      const currentBalance = currBalance.Balance;
      const previousBalance = prevBalance.Balance;

      // Calculate percentage change between the current and previous month
      const monthlyPercentageChange = Math.abs((currentBalance - previousBalance) / previousBalance) * 100;

      // Determine the trend based on current and previous month sales
      let trend = "Flat";
      if (currentBalance > previousBalance) {
          trend = "Upward";
      } else if (currentBalance < previousBalance) {
          trend = "Downward";
      }

      setBalanceTrend(trend);
      setPercentage(monthlyPercentageChange.toFixed(2));
    }
  }

  const LegendFormatterForLedgerGraph = (value) => {
    if (value === "TotalDebit") {
      return "Debit";
    } else if (value === "TotalCredit") {
      return "Credit";
    } else if (value === "Balance") {
      return "Account Balance";
    }
    return value;
  };

  return (
    <div className='ledger-graph-view'>
      <div className='ledger-graph-view__wrapper'>
        <div className='ledger-graph-view__header'>
            <h3>General Ledger</h3>
            <p>Last 3 Months</p>
            <i className="ledger-graph-view__close-icon fa-solid fa-xmark" onClick={onClick}></i>
        </div>
        <div className='ledger-graph-view__body'>
            
            <div className='ledger-graph-view__graph-wrapper'>
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart
                        width={500}
                        height={400}
                        data={structuredData}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 20,
                            bottom: 0,
                        }}
                    >
                    <Legend formatter={LegendFormatterForLedgerGraph}/>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Month" tick={{fontSize:12}}/>
                    <YAxis />
                    <Tooltip content={<CustomToolTipForLedgerGraph />} />

                    <Line 
                        type="monotone" 
                        dataKey="Balance" 
                        stroke="#8884d8" 
                        strokeWidth={3} 
                    />

                    <Line 
                        type="monotone" 
                        dataKey="TotalCredit" 
                        stroke="#82ca9d" 
                        strokeWidth={3} 
                    />

                    <Line 
                        type="monotone" 
                        dataKey="TotalDebit" 
                        stroke="#ffc658" 
                        strokeWidth={3} 
                    />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className='ledger-graph-view__message-wrapper'>
              {
                balanceTrend === 'Upward' ? (
                  <GoodMessage 
                    message={`
                      Balance is on upward status, it was up by ${percentage}% from the previous month. 
                      This indicates that sales are strong, expenses are well-managed, and inventory is being effectively handled. 
                      The overall financial health is improving, suggesting a positive growth trend in the business.
                    `} 
                  />
                ):(
                  <WarningMessage 
                    message={`
                      The balance is in a downward trend, having decreased by ${percentage}% from the previous month. 
                      This suggests that sales may be slowing. It's best to avoid incurring unnecessary expenses and manage inventory wisely.
                    `}
                  />
                )
              }
              
            </div>
            
        </div>
      </div>
    </div>
  )
}

export default LedgerGraphView
