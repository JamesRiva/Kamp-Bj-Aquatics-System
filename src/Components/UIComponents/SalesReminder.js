import React,{ useState, useEffect } from 'react';
import '../Styles/Reminder.css';
import ButtonComponent from './ButtonComponent';
import {
    ComposedChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from 'recharts';
  import { GoodMessage, WarningMessage } from './CustomMessages';
  import LoadingState from './LoadingState';
  import { ToastError } from './ToastComponent';
  import { CustomToolTipForReminders } from './CustomToolTip';

const SalesReminder = ({proceed, cancel}) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const defaultDate = useState(new Date().toLocaleDateString('default', { month:'numeric', year:'numeric' }))
    const [structuredData, setStructuredData] = useState([]);
    const [balanceTrend, setBalanceTrend] = useState('');
    const [percentage, setPercentage] = useState();
    const [loadingState, setLoadingState] = useState(false);

    const formatDate = () => {
        const splittedDate = defaultDate[0].split('/');
        const month = splittedDate[0].padStart(2, '0'); 
        const year = splittedDate[1];

        return `${year}-${month}`
        
    }
      
    useEffect(() => {
        getExpensesMonthly();
    }, []);

    const getExpensesMonthly = async() => {
    
            const currentMonth = formatDate();
            const [year, month] = currentMonth.split('-');
            const subtractedDate = new Date(year, month);
            subtractedDate.setMonth(subtractedDate.getMonth() - 3);
        
            const newYear = subtractedDate.getFullYear();
            const newMonth = subtractedDate.getMonth().toString().padStart(2, '0');
    
            const currMonth = currentMonth;
            const endMonth = `${newYear}-${newMonth}`
    
            setLoadingState(true);
    
            fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getSalesReminder.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currMonth: currMonth, endMonth: endMonth }),
            })
                .then(response => response.json())
                .then(data => {
                if(data.data.length > 0) {
                    const formatData = data.data.map(item => ({
                        month : item.month,
                        sales : Number(item.total_sales),
                    }))

                    setStructuredData(formatData);
                    calculateTrend(formatData);
                }else {
                    ToastError('No sales data found');
                }
                    
                })
                .catch(error => {
                    console.error('Error fetching sales reminder:', error);
                    ToastError('An error occurred while fetching data');
                })
                .finally(() => {
                    setLoadingState(false);
                });
                  
        }

        const calculateTrend = (salesData) => {
            // Find the current month and its previous month sales
            const currentMonth = salesData[salesData.length - 1]; // Latest data point (current month)
            const previousMonth = salesData[salesData.length - 2]; // Second last data point (previous month)
        
            if (currentMonth && previousMonth) {
                const currentSales = currentMonth.sales;
                const previousSales = previousMonth.sales;
        
                // Calculate percentage change between the current and previous month
                const monthlyPercentageChange = Math.abs((currentSales - previousSales) / previousSales) * 100;
        
                // Determine the trend based on current and previous month sales
                let trend = "Flat"; // Default trend
                if (currentSales > previousSales) {
                    trend = "Upward";
                } else if (currentSales < previousSales) {
                    trend = "Downward";
                }
        
                setBalanceTrend(trend);
                setPercentage(monthlyPercentageChange.toFixed(2));
            }
        }

  return (
    <div className='reminder'>

      <div className='reminder__container'>
        <i className="reminder__close-icon fa-solid fa-xmark" onClick={cancel}></i>

        <div className='reminder__title-wrapper'>
            <h3>Sales Reminder</h3>
            <p>Last 3 Months</p>
        </div>

        <div className='reminder__body'>

            <div className='reminder__graphs-container'>
                <ResponsiveContainer width="100%" height={300}>
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
                    <Legend />
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{fontSize:14}}/>
                    <YAxis tick={{fontSize:14}}/>
                    <Tooltip content={CustomToolTipForReminders}/>
                    <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        strokeWidth={3} 
                    />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className='reminder__message-wrapper'>
                {
                    balanceTrend === 'Upward' ? (
                    <GoodMessage 
                        message={`Current month ( ${formatDate()} ) sales is on upward status, it was up by ${percentage}% from the previous month. This shows that sales during this month is stronger compared to previous month.`} 
                    />
                    ):(
                    <WarningMessage 
                        message={`Sales is in a downward status, having decreased by ${percentage}% from the previous month. This suggest that sales during this month is weaker compared to previous month`}
                    />
                    )
                }
            </div>
        </div>

        <div className='reminder__footer'>
            <ButtonComponent label='Proceed' onClick={proceed}/>
            <ButtonComponent label='Cancel' onClick={cancel}/>
        </div>
      </div>
    
      {loadingState && <LoadingState />}
    </div>
  )
}

export default SalesReminder
