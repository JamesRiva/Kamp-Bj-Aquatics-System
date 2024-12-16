import React, { useEffect, useState } from 'react';
import { MonthSelection } from '../UIComponents/DateControls';
import '../Styles/DashboardMonthly.css';
import {  ToastError } from '../UIComponents/ToastComponent';
import { CustomTooltip, CustomToolTipForRestockVsSales } from '../UIComponents/CustomToolTip';
import { LegendFormatter } from '../UIComponents/LegendFormatter';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, Legend, Rectangle } from 'recharts';

const DashboardMonthly = () => {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [topProductsData, setTopProductsData] = useState([]);
  const [displayedMonth, setDisplayedMonth] = useState(new Date().toLocaleDateString('default', { month:'long', year:'numeric' }));
  const [salesData, setSalesData] = useState([]);
  const [dataSalesExpenses, setDataSalesExpenses] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const apiUrl = process.env.REACT_APP_API_URL;

   // To set default date based on the most current date
useEffect(() => {
  const currentDate = new Date(); // Get the current date
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Format month as MM
  const formattedMonth = `${year}-${month}`; // Format as YYYY-MM

  setSelectedMonth(formattedMonth); // Set the default selected month
  getTop5Products(formattedMonth); // Fetch top 5 products
  getSalesRestock(formattedMonth); // Fetch sales vs restock data
  getExpensesData(formattedMonth); // Fetch expenses breakdown
  getTotalSalesByTime(formattedMonth);
  getTotalSalesAmount(formattedMonth);

}, []); // Empty dependency array ensures this runs once when the component mounts


  const handleMonthChange = (selectedMonth) => {
    setDisplayedMonth(selectedMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' }));
    if (!selectedMonth) {
      ToastError("Please select a valid month.");
      return;
    }
  
    const year = selectedMonth.getFullYear();
    const month = (selectedMonth.getMonth() + 1).toString().padStart(2, '0'); // Format month
    const formattedMonth = `${year}-${month}`;
  
    setSelectedMonth(formattedMonth);
    getTop5Products(formattedMonth);
    getTotalSalesByTime(formattedMonth);
    getSalesRestock(formattedMonth);
    getExpensesData(formattedMonth);
    getTotalSalesAmount(formattedMonth);
  };
  

const getTop5Products = (formattedMonth) => {
  fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getTop5Products.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ selectedMonth: formattedMonth, timePeriod: 'monthly' }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.length > 0) {
        const formattedData = data.map(item => ({
          name: item.productName,
          Total_Sales: parseFloat(item.Total_Sales),
        }));
        setTopProductsData(formattedData);
      } else {
        setTopProductsData([]);
      }
    })
    .catch(error => {
      console.error("Fetch Error:", error);
      ToastError('Error fetching data: ' + error.message);
    });
}

const getTotalSalesByTime = (month) => {
  if (month) {
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getMonthlySales.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedMonth:month }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setSalesData(data.map(item => ({
          day: new Date(item.day).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
          sales: item.sales,
        })));
      })
      .catch(error => {
        console.error("Fetch Error:", error);
        ToastError('Error fetching sales data: ' + error.message);
      });
  }
}

const getTotalSalesAmount = (month) => {
  fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getTotalSales.php`, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ selectedDate: month, timePeriod: 'monthly' }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.status === 'success' && data.totalSales) {
        setTotalSales(data.totalSales); // Set the `totalSales` string directly
      } else {
        setTotalSales('0.00'); // Default value if data is invalid
        ToastError('No sales data found for the selected date.');
      }
    })
    .catch(error => {
      console.error("Fetch Error:", error);
      ToastError('Error fetching total sales: ' + error.message);
    });
}

const getSalesRestock = (month) => {
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/fetchSalesRestockData.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedDate: month, filterType: 'monthly' }),
  })
  .then(response => response.json())
  .then(data => setDataSalesExpenses(data))
  .catch(error => console.error('Error:', error));

}

const getExpensesData = (month) => {
  fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/fetchExpensesBreakdown.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedDate: month }),
    })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success' && data.data) {
            const formattedExpensesData = data.data.map(item => ({
              name: item.name,  // Expense title
              total: item.total,  // Total amount
            }));
            setExpenses(formattedExpensesData); // Set the formatted data for the graph
          } else {
            setExpenses([]);
            ToastError('No expense data found for the selected year.');
          }
        }) // `setExpenses` updates the graph data state
        .catch(error => console.error('Error fetching expenses breakdown:', error));
}

const truncateLabel = (label, maxLength ) => {
  if (label.length > maxLength) {
    return `${label.slice(0, maxLength)}...`;
  }
  return label;
};

  return (
    <div className='dashboard-monthly'>
      <div className='dashboard-monthly__header'>
        <MonthSelection 
          onChange={handleMonthChange}
          displayDate={displayedMonth}
        />
      </div>
      <div className='dashboard-monthly__body'>

        <div className='graph-container monthly-total-sales'>
          <h3 className='graph-title'>Total Sales : ₱ {totalSales} </h3>
          <ResponsiveContainer width="100%" height="95%">
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
              <XAxis dataKey="day" dy={10} tick={{ fontSize: 14 }} />
              <YAxis tick={{ fontSize: 14 }}/>
              <Tooltip  content={<CustomTooltip />}/>
              <Legend formatter={(value) => LegendFormatter(value, 'sales', 'Total Sales')}/>
              <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className='graph-container monthly-most-sold-products'>
          <h3 className='graph-title'>Top 10 Most Sold Products</h3>
          <ResponsiveContainer width="100%" height="95%">
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
              <XAxis dataKey="name" 
                dy={10}
                angle={-50}
                tick={({ x, y, payload }) => {
                  const label = truncateLabel(payload.value, 2);  // Truncate label
                  return (
                    <text x={x} y={y} textAnchor="middle" dy={15} fontSize={14}>
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

        <div className='graph-container monthly-sales-vs-restocks'>
          <h3 className='graph-title'>Sales vs Restocks</h3>
          <ResponsiveContainer width="100%" height="95%">
            <BarChart
              width={500}
              height={300}
              data={dataSalesExpenses}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }}/>
              <YAxis tick={{ fontSize: 14 }}/>
              <Tooltip  content={<CustomToolTipForRestockVsSales />}/> 
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
              <Bar dataKey="restock" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className='graph-container monthly-expenses-breakdown'>
          <h3 className='graph-title'>Expenses Breakdown</h3>
          <ResponsiveContainer width="100%" height="95%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={expenses}>
              <Tooltip  content={<CustomTooltip />}/>
              <Legend formatter={(value) => LegendFormatter(value, 'total', 'Total Expenses')}/>
              <PolarGrid />
              <PolarAngleAxis dataKey="name"
                
                tick={({ x, y, payload }) => {
                  const label = truncateLabel(payload.value, 10);  // Truncate label
                  return (
                    <text x={x} y={y} textAnchor="middle" fontSize={14}>
                      {label}
                    </text>
                  );
                }}
              />
              <Radar dataKey="total" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default DashboardMonthly
