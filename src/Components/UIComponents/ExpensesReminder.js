import React,{ useState, useEffect } from 'react';
import '../Styles/Reminder.css';
import ButtonComponent from './ButtonComponent';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    AreaChart,
    Area,
    ResponsiveContainer,
  } from 'recharts';
  import { GoodMessage, WarningMessage } from './CustomMessages';
  import { ToastError, ToastSuccess } from './ToastComponent';
  import LoadingState from '../UIComponents/LoadingState';
  import { CustomToolTipForReminders } from './CustomToolTip';

const ExpensesReminder = ({proceed, cancel}) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const defaultDate = useState(new Date().toLocaleDateString('default', { month:'numeric', year:'numeric' }));
    const [loadingState, setLoadingState] = useState(false);
    const [structuredData, setStructuredData] = useState([]);
    const [balanceTrend, setBalanceTrend] = useState('');
    const [percentage, setPercentage] = useState();

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

        fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getExpensesReminder.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currMonth: currMonth, endMonth: endMonth }),
        })
            .then(response => response.json())
            .then(data => {
            if(data.data.length > 0) {
                const formatData = data.data.map(item => ({
                    month : item.month,
                    expenses : Number(item.total_expenses),
                }))
                setStructuredData(formatData);
                calculateTrend(formatData);
            }else {
                ToastError('No expense data found');
            }
                
            })
            .catch(error => {
                console.error('Error fetching expenses reminder:', error);
                ToastError('An error occurred while fetching data');
            })
            .finally(() => {
                setLoadingState(false);
            });
              
    }

    const calculateTrend = (expensesData) => {
        // Find the current month and its previous month sales
        const currentMonth = expensesData[expensesData.length - 1]; // Latest data point (current month)
        const previousMonth = expensesData[expensesData.length - 2]; // Second last data point (previous month)
    
        if (currentMonth && previousMonth) {
            const currentExpenses = currentMonth.expenses;
            const previousExpenses = previousMonth.expenses;
    
            // Calculate percentage change between the current and previous month
            const monthlyPercentageChange = Math.abs((currentExpenses - previousExpenses) / previousExpenses) * 100;
    
            // Determine the trend based on current and previous month sales
            let trend = "Flat";
            if (currentExpenses > previousExpenses) {
                trend = "Upward";
            } else if (currentExpenses < previousExpenses) {
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
            <h3>Expenses Reminder</h3>
            <p>Last 3 Months</p>
        </div>

        <div className='reminder__body'>

            <div className='reminder__graphs-container'>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                        width={500}
                        height={400}
                        data={structuredData}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                        >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{fontSize : 14}} />
                        <YAxis tick={{fontSize: 14}}/>
                        <Legend />
                        <Tooltip content={<CustomToolTipForReminders />}/>
                        <Area type="monotone" dataKey="expenses" stroke="#8884d8" fill="#8884d8" strokeWidth={3}  />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className='reminder__message-wrapper'>
                {
                    balanceTrend === 'Upward' ? (
                    <WarningMessage 
                        message={`Current month's ( ${formatDate()} ) expenses is on upward status, it was up by ${percentage}% from the previous month. This shows that current expenses is on the rise, its best to refrain from incurring unnecessary expenses as it might affect the business negatively.`} 
                    />
                    ):(
                    <GoodMessage 
                        message={`Current month's ( ${formatDate()} ) expenses is on downward status, it was down by ${percentage}% from the previous month. This shows that current expenses is well maintained and balanced, this positively impact the business.`}
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

export default ExpensesReminder
