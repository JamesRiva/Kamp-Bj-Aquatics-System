import React, { useState, useEffect } from 'react';
import { DateSelection } from '../UIComponents/DateControls';
import '../Styles/DashboardDaily.css';
import DashboardCards from '../UIComponents/DashboardCards';
import { ToastError } from '../UIComponents/ToastComponent';
import { CustomTooltip } from '../UIComponents/CustomToolTip';
import { LegendFormatter } from '../UIComponents/LegendFormatter';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
        ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';



const DashboardDaily = () => {    
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString());
  const [topProductsData, setTopProductsData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [salesCount, setSalesCount] = useState(null);
  const [averageSales, setAverageSales] = useState(0);  
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleDatechange = (newDate) => {
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
  
    const formattedDate = `${year}-${month}-${day}`;
    setSelectedDate(formattedDate);
  };


  useEffect(() => {
    const currentDate = new Date();
    handleDatechange(currentDate);
  }, []);

  useEffect(() => {
    // Fetch data from the PHP script with the selectedDate
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getTop5Products.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedDate, timePeriod: 'daily' }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          // Transform the data to fit the chart format if necessary
          const formattedData = data.map(item => ({
            name: item.productName,
            Total_Sales: parseFloat(item.Total_Sales),
            quantity: item.quantity,
          }));
          setTopProductsData(formattedData);
        } else {
          setTopProductsData([]);
        }
      })
      .catch(error => {
        ToastError('Error fetching data:', error);
      });
  }, [selectedDate]);

  useEffect(() => {
    const timestamp = new Date().getTime();  // Add timestamp to prevent caching
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getTotalSales.php?timestamp=${timestamp}`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedDate, timePeriod: 'daily' }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setTotalSales(data.totalSales);
        } else {
          setTotalSales(0);
          ToastError('No sales data found for the selected date.');
        }
      })
      .catch(error => {
        ToastError('Error fetching total sales:', error);
      });
  }, [selectedDate]);
  

  useEffect(() => {
    // Fetch the sales data from the PHP script
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getTotalSalesCount.php`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedDate, timePeriod: 'daily' }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setSalesCount(data.totalSalesCount); // Set the sales data
        } else {
          console.error('Error fetching sales data:', data.message);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [selectedDate]);


  // useEffect(() => {
  //   // Fetch the average sales amount for the selected date
  //   fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getAverageSalesAmount.php`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ selectedDate, timePeriod: 'daily' }),
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       if (data.status === 'success') {
  //         setAverageSales(data.averageSales);
  //       } else {
  //         setAverageSales(0);
  //         ToastError('No sales data found for the selected date.');
  //       }
  //     })
  //     .catch(error => {
  //       ToastError('Error fetching average sales amount:', error);
  //     });
  // }, [selectedDate]);

  // Fetch sales data for the selected date
  useEffect(() => {
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getTotalSalesByTime.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedDate }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          // Format the data to fit the AreaChart
          const formattedSalesData = data.map(item => ({
            name: item.timePeriod,  // The time period for sales (e.g., '12 AM - 12 PM')
            value: parseFloat(item.totalSales),  // Total sales value for that period
          }));
          
          setSalesData(formattedSalesData);
        } else {
          ToastError('No sales data available for the selected date.');
          setSalesData([]);
        }
      })
      .catch(error => {
        ToastError('Error fetching data:', error);
      });
  }, [selectedDate]); 

  const truncateLabel = (label, maxLength = 5  ) => {
    if (label.length > maxLength) {
      return `${label.slice(0, maxLength)}...`;
    }
    return label;
  };

  
  return (
    <div className='dashboard-daily'>
      <div className='dashboard-daily__header'>
        <DateSelection
          onChange={handleDatechange}
          displayDate={selectedDate}
        />
      </div>

    <div className='dashboard-daily__cards'>
      <DashboardCards icon="fa-peso-sign" title="Total Sales Today" subTitle="Total Sales Made Today" description={`₱ ${String(totalSales)}`} />
      <DashboardCards icon='fa-cart-shopping' title="Sales Transactions" subTitle="Number of Sales Transactions Today" description={String(salesCount)} />
      {/* <DashboardCards icon='fa-receipt' title="Average Sales Per Transactions" subTitle="Total Average Sales Per Transactions" description={`₱ ${String(averageSales)}`} /> */}
    </div>

      <div className='dashboard-daily__body'>
        <div className='graph-container daily-total-sales'>
          <h3 className='graph-title'>Total Sales</h3>
          <ResponsiveContainer width="100%" height="96%">
            <AreaChart
              width={500}
              height={400}
              data={salesData}
              margin={{
                top: 30,
                right: 30,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 13 }}/>
              <YAxis tick={{ fontSize: 14 }} />
              <Tooltip  content={<CustomTooltip />}/>
              <Legend formatter={(value) => LegendFormatter(value, 'value', 'Total Sales')}/>
              <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className='graph-container daily-most-sold-products'>
          <h3 className='graph-title'>Top 10 Most Sold Products</h3>
          <ResponsiveContainer width="100%" height="96%">
            <BarChart
              width={500}
              height={300}
              data={topProductsData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                dy={10}
                angle={20}
                
                tick={({ x, y, payload }) => {
                  const label = truncateLabel(payload.value);  // Truncate label
                  return (
                    <text x={x} y={y} textAnchor="middle" fontSize={14} dy={10}>
                      {label}
                    </text>
                  );
                }}

              />
              <YAxis tick={{ fontSize: 14 }}/>
              <Tooltip  content={<CustomTooltip />}/>
              <Legend formatter={(value) => LegendFormatter(value, 'Total_Sales', 'Total Product Sales')}/>
              <Bar dataKey="Total_Sales" stackId="a" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
      </div>
    </div>
  )
}

export default DashboardDaily
