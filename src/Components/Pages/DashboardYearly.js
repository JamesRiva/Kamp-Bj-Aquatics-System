import React, { useEffect, useState } from 'react';
import { YearSelection } from '../UIComponents/DateControls';
import '../Styles/DashboardYearly.css'
import { ToastError } from '../UIComponents/ToastComponent';
import { CustomTooltip, CustomToolTipForRestockVsSales } from '../UIComponents/CustomToolTip';
import { LegendFormatter } from '../UIComponents/LegendFormatter';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, Legend, Rectangle } from 'recharts';


const DashboardYearly = () => {
  const [selectedYear, setSelectedYear] = useState(new Intl.DateTimeFormat('default', { year:'numeric' }).format(new Date()));
  const [totalSales, setTotalSales] = useState(0);
  const [topProductsData, setTopProductsData] = useState([]);
  const [dataSalesExpenses, setDataSalesExpenses] = useState([]);
  const [dataYearlySales, setDataYearlySales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;


  useEffect(() => {
    const currentDate = new Date(); // Get the current date
    const year = currentDate.getFullYear();
  
    setSelectedYear(year); // Set the default selected month
    getTop5Products(year); // Fetch top 5 products
    getSalesRestock(year); // Fetch sales vs restock data
    getExpensesData(year); // Fetch expenses breakdown
    getYearlySales(year);
    getTotalSalesAmount(year);
  
  }, []);
  
  const handleYearChange = (selectedYear) => {

    const formattedYear = new Intl.DateTimeFormat('default', {year:'numeric'}).format(selectedYear)
    setSelectedYear(formattedYear);

    getTotalSalesAmount(formattedYear);
    getTop5Products(formattedYear);
    getSalesRestock(formattedYear);
    getYearlySales(formattedYear);
    getExpensesData(formattedYear);
  }

  const getTop5Products = (year) => {
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getTop5Products.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedDate: year, timePeriod: 'yearly' }),
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


  const getTotalSalesAmount = (year) => {
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getTotalSales.php`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedDate: year, timePeriod: 'yearly' }),
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

  const getSalesRestock = (year) => {
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/fetchSalesRestockData.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedDate: year, filterType: 'yearly' }),
  })
  .then(response => response.json())
  .then(data => setDataSalesExpenses(data))
  .catch(error => console.error('Error:', error));

}

const getYearlySales = async (year) => {
  try {
    const response = await fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/fetchYearlySales.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ year }),
    });
    const result = await response.json();
    if (result.success) {
      setDataYearlySales(result.data);
    } else {
      ToastError(result.message);
    }
  } catch (error) {
    ToastError('Failed to fetch sales data');
  }
};

const getExpensesData = (year) => {
  fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/fetchExpensesBreakdown.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedDate: year }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success' && data.data) {
        const formattedExpensesData = data.data.map(item => ({
          name: item.name,  // Expense title
          total: parseFloat(item.total),  // Total amount
        }));
        setExpenses(formattedExpensesData); // Set the formatted data for the graph
      } else {
        setExpenses([]);
        ToastError('No expense data found for the selected year.');
      }
    })
    .catch(error => console.error('Error fetching expenses breakdown:', error));
};

  const truncateLabel = (label, maxLength ) => {
    if (label.length > maxLength) {
      return `${label.slice(0, maxLength)}...`;
    }
    return label;
  };


  return (
    <div className='dashboard-yearly'>
      <div className='dashboard-yearly__header'>
        <YearSelection 
          onChange={handleYearChange}
          displayDate={selectedYear}
        />
      </div>
      <div className='dashboard-yearly__body'>

        <div className='graph-container yearly-total-sales'>
          <h3 className='graph-title'>Total Sales ₱ {totalSales}</h3>
          <ResponsiveContainer width="100%" height="95%">
            <AreaChart
              width={500}
              height={400}
              data={dataYearlySales}
              margin={{
                top: 30,
                right: 30,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 14, angle: -15, dy: 10, }} />
              <YAxis tick={{ fontSize: 14 }}/>
              <Tooltip  content={<CustomTooltip />}/>
              <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className='graph-container yearly-most-sold-products'>
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
                  const label = truncateLabel(payload.value, 5);  // Truncate label
                  return (
                    <text x={x} y={y} textAnchor="middle" dy={15}  fontSize={12}>
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

        <div className='graph-container yearly-sales-vs-restocks'>
          <h3 className='graph-title'>Sales vs Restocks</h3>
          <ResponsiveContainer width="100%" height="95%">
            <BarChart
              width={500}
              height={300}
              data={dataSalesExpenses}
              margin={{
                top: 5,
                right: 0,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" height={50} tick={{ fontSize: 14, angle: -15, dy: 10, }}/>
              <YAxis tick={{ fontSize: 14 }}/>
              <Tooltip  content={<CustomToolTipForRestockVsSales />}/>
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
              <Bar dataKey="restock" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className='graph-container yearly-expenses-breakdown'>
          <h3 className='graph-title'>Expenses Breakdown</h3>
          <ResponsiveContainer width="100%" height="95%">
          {expenses.length > 0 ? (
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={expenses}>
              <Tooltip  content={<CustomTooltip />}/>
              <PolarGrid />
              <Legend formatter={(value) => LegendFormatter(value, 'total', 'Total Expenses')}/>
              <PolarAngleAxis dataKey="name" 
                tick={({ x, y, payload }) => {
                  const label = truncateLabel(payload.value, 12);  // Truncate label
                  return (
                    <text x={x} y={y} textAnchor="middle" dy={2} fontSize={12}>
                      {label}
                    </text>
                  );
                }}
              />
              <Radar dataKey="total" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          ) : (
            <p>No expense data available for the selected year.</p>
          )}

          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}

export default DashboardYearly
