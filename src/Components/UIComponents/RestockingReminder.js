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
    AreaChart,
  } from 'recharts';
  import { GoodMessage, WarningMessage } from './CustomMessages';
  import LoadingState from './LoadingState';
  import { ToastError } from './ToastComponent';
  import { CustomToolTipForReminders } from './CustomToolTip';

const RestockingReminder = ({proceed, cancel}) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const defaultDate = useState(new Date().toLocaleDateString('default', { month:'numeric', year:'numeric' }))
    const [structuredData, setStructuredData] = useState([]);
    const [balanceTrend, setBalanceTrend] = useState('');
    const [percentage, setPercentage] = useState();
    const [loadingState, setLoadingState] = useState(false);

    const restockData = [
        { Month: "2024-06", totalRestock: 50000 }, //starting totalRestock
        { Month: "2024-07", totalRestock: 10554 },
        { Month: "2024-08", totalRestock: 15345 },
        { Month: "2024-09", totalRestock: 25664 },  
        { Month: "2024-10", totalRestock: 30000 }, 
        { Month: "2024-11", totalRestock: 60000 },
        { Month: "2024-12", totalRestock: 70000 }, //Current month
    ];

    const formatDate = () => {
        const splittedDate = defaultDate[0].split('/');
        const month = splittedDate[0].padStart(2, '0'); 
        const year = splittedDate[1];

        return `${year}-${month}`
        
    }
      
    useEffect(() => {
        getRestockMonthly();
    }, []);

    const getRestockMonthly = () => {
        const currentMonth = formatDate();
        const [year, month] = currentMonth.split('-');
        const subtractedDate = new Date(year, month);
        subtractedDate.setMonth(subtractedDate.getMonth() - 3);
    
        const newYear = subtractedDate.getFullYear();
        const newMonth = subtractedDate.getMonth().toString().padStart(2, '0');

        const currMonth = currentMonth;
        const endMonth = `${newYear}-${newMonth}`

        setLoadingState(true);

        fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getRestockReminder.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currMonth: currMonth, endMonth: endMonth }),
        })
            .then(response => response.json())
            .then(data => {
            if(data.data.length > 0) {
                const formatData = data.data.map(item => ({
                    month : item.month,
                    restock : Number(item.total_restock),
                }))

                console.log(formatData);
                setStructuredData(formatData);
                calculateTrend(formatData);
            }else {
                ToastError('No restock data found');
            }
                        
            })
            .catch(error => {
                console.error('Error fetching restocks reminder:', error);
                ToastError('An error occurred while fetching data');
            })
            .finally(() => {
                setLoadingState(false);
            });
    }

    const calculateTrend = (restockData) => {
        // Find the current month and its previous month sales
        const currentMonth = restockData[restockData.length - 1]; // Latest data point (current month)
        const previousMonth = restockData[restockData.length - 2]; // Second last data point (previous month)
    
        if (currentMonth && previousMonth) {
            const currentRestock = currentMonth.restock;
            const previousRestock = previousMonth.restock;
    
            // Calculate percentage change between the current and previous month
            const monthlyPercentageChange = Math.abs((currentRestock - previousRestock) / previousRestock) * 100;
    
            // Determine the trend based on current and previous month sales
            let trend = "Flat"; // Default trend
            if (currentRestock > previousRestock) {
                trend = "Upward";
            } else if (currentRestock < previousRestock) {
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
            <h3>Restock Reminder</h3>
            <p>Last 6 Months</p>
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
                            left: 20,
                            bottom: 0,
                        }}
                    >
                    <Legend />
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{fontSize:14}}/>
                    <YAxis tick={{fontSize:14}}/>
                    <Tooltip content={<CustomToolTipForReminders />}/>
                    <Area 
                        type="monotone" 
                        dataKey="restock" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        strokeWidth={3} 
                    />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className='reminder__message-wrapper'>
            {
                balanceTrend === 'Upward' ? (
                    <GoodMessage 
                        message={`Current month (${formatDate()}) restocks are on an upward trend, showing an increase of ${percentage}% from the previous month. This suggests that you're keeping inventory levels well-stocked, ensuring products are available to meet customer demand.<br><br> At the same time, make sure to balance restocking with sales as it was registered as debit on the ledger and could effect the balance of the business.`}
                    />
                ) : (
                    <WarningMessage 
                        message={`Current month (${formatDate()}) restocks are on a downward trend, with a ${percentage}% decrease compared to the previous month. This could indicate potential stockouts and lost sales opportunities. <br><br>However be mindful of maintaining a balance to prevent overstocking and unnecessary costs.`}
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

export default RestockingReminder
