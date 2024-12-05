import React, { useEffect, useRef, useState } from 'react';
import '../Styles/ReportsInventory.css';
import GraphsImageDownloader from '../UIComponents/GraphsImageDownloader';
import GeneratePdf from '../UIComponents/GeneratePdf';
import { MonthSelection, YearSelection } from '../UIComponents/DateControls';
import { ComposedChart, Bar, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ToastError } from '../UIComponents/ToastComponent';

const ReportsInventory = () => {
  
  const [activeFilter, setFilter] = useState('monthly');

  const reportsValues = {
    'monthly': <ReportsInventoryMonthly />,
    'yearly': <ReportsInventoryYearly />
  }

  const handleOnChangeFilter = (e) => {
    setFilter(
      e.target.value
    )
  }

  return (
    <div className='reports-inventory'>
      <div className='reports-inventory__header'>
        <select className='reports__filter' onChange={handleOnChangeFilter}>
          <option value='monthly'>Monthly</option>
          <option value='yearly'>Yearly</option>
        </select>
      </div>

      <div className='reports-inventory__body'>
        {reportsValues[activeFilter]}
      </div>
      
    </div>
  )
}

export default ReportsInventory



export const ReportsInventoryMonthly = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [mostRestockedProductsData, setMostRestockedProductsData] = useState([]);
  const [leastRestockedProductsData, setLeastRestockedProductsData] = useState([]);
  const [averageTimeToSell, setAverageTimeToSell] = useState([]);
  const [displayedMonth, setDisplayedMonth] = useState(new Date().toLocaleDateString('default', { month:'long', year:'numeric' }));
  
  const handleMonthChange = (selectedMonth) => {
    setDisplayedMonth(selectedMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' }));

    const year = selectedMonth.getFullYear();
    const month = (selectedMonth.getMonth() + 1).toString().padStart(2, '0'); // Format month
    const formattedMonth = `${year}-${month}`;

    fetchMostRestockedProducts(formattedMonth);
    fetchLeastRestockedProducts(formattedMonth);
    getATS(formattedMonth);
  };

  useEffect(() => {
    const currentDate = new Date(); 
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const formattedMonth = `${year}-${month}`;

    fetchMostRestockedProducts(formattedMonth);
    fetchLeastRestockedProducts(formattedMonth);
    getATS(formattedMonth);
  },[])

  const fetchMostRestockedProducts = (selectedMonth) => {
    // Fetch data from the PHP script with the selectedDate
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getMostRestockedProductsMonthly.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedDate: selectedMonth }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const formattedData = data.map(item => ({
            name: item.productName,
            frequency: item.restockFrequency,
          }));
          setMostRestockedProductsData(formattedData);
        } else {
          setMostRestockedProductsData([]);
        }
      })
      .catch(error => {
        ToastError('Error fetching data:', error);
      });
  }

  const fetchLeastRestockedProducts = (selectedMonth) => {
    // Fetch data from the PHP script with the selectedDate
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getLeastRestockedProductsMonthly.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedDate: selectedMonth }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const formattedData = data.map(item => ({
            name: item.productName,
            frequency: item.restockFrequency,
          }));
          setLeastRestockedProductsData(formattedData);
        } else {
          setLeastRestockedProductsData([]);
        }
      })
      .catch(error => {
        ToastError('Error fetching data:', error);
      });
  }

  const getATS = (selectedMonth) => {
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getATS.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dateRange: selectedMonth }),
    })
      .then(response => response.json())
      .then(data => {
        if(data.length > 0){
          setAverageTimeToSell(data); // Assuming you use useState to manage chart data
        }else{
          setAverageTimeToSell([]); // Assuming you use useState to manage chart data
        }
        
      })
      .catch(error => console.error('Error fetching gross margin data:', error));
                  
  }

  const truncateLabel = (label, maxLength ) => {
    if (label.length > maxLength) {
      return `${label.slice(0, maxLength)}...`;
    }
    return label;
  };

  

  return(
    <div className='reports-inventory-component'>
      <div className='reports-inventory-component__header'>
        <MonthSelection 
          onChange={handleMonthChange}
          displayDate={displayedMonth}
        />
        <GeneratePdf 
          elementId='graphs-container' 
          date={displayedMonth} 
          reportTitle='Inventory Report'
          elementGraphsTable='graph-container__table' 
          elementsGraphsDescription='graph-container__description'
          elementGraphWrapper='graphs-container__chart-wrapper'
          graphWrapperHeight='300px'
        />
      </div>

      <div className='reports-inventory-component__body' id='component-body'>

        <div className='graphs-container graph-shadow' id='graph-container-avg-selling-time'>
          <div className='graphs-header'>
            <h3 className='reports-inventory-graph-title'>Average Selling Time</h3>
            <GraphsImageDownloader elementId='graph-container-avg-selling-time' />
          </div>
          <div className='graphs-container__chart-wrapper' style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer>
              <AreaChart
                width={500}
                height={400}
                data={averageTimeToSell}
                margin={{
                  top: 30,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" dy={5} tick={{ fontSize: 14 }} />
                <YAxis tick={{ fontSize: 14 }}/>
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Average_Selling_Time_Days" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className='graph-container__table'>
            <h4>Average Selling Time Table</h4>
              <table className='graph-table'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    averageTimeToSell.map((items, index) => (
                      <tr key={index}>
                        <td>{items.productName}</td>
                        <td>{items.Average_Selling_Time_Days}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
          </div>   
          
          <div className='graph-container__description'>
            <p>
              This chart displays the average selling time for each product, measured in days. The "Average Selling Time" represents the number of days it takes for a product to sell after it has been restocked. A shorter average selling time indicates faster-moving products, while a longer average selling time may suggest slower sales.
            </p>
          </div>
  
          
        </div>

        <div className='graphs-container graph-shadow' id='graph-container-most-frequently-restocked'>
          <div className='graphs-header'>
            <h3 className='reports-inventory-graph-title'>Most Frequently Restocked Products (Top 5)</h3>
            <GraphsImageDownloader elementId='graph-container-most-frequently-restocked'/>
          </div>
          <div className='graphs-container__chart-wrapper' style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer>
              <ComposedChart
                width={500}
                height={400}
                data={mostRestockedProductsData}
                margin={{
                  top: 30,
                  right: 20,
                  bottom: 20,
                  left: 5,
                }}
              >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="name" scale="band" angle={-20} 
                  tick={({ x, y, payload }) => {
                    const label = truncateLabel(payload.value, 14);  // Truncate label
                    return (
                      <text x={x} y={y} textAnchor="middle" fontSize={14} dy={10}>
                        {label}
                      </text>
                    );
                  }}
                />
                <YAxis tick={{ fontSize: 14 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="frequency" barSize={60} fill="#413ea0" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className='graph-container__table'>
            <h4>Most Frequently Restocked Products Table</h4>
              <table className='graph-table'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    mostRestockedProductsData.map((items, index) => (
                      <tr key={index}>
                        <td>{items.name}</td>
                        <td>{items.frequency}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
          </div>   
          
          <div className='graph-container__description'>
            <p>
              This chart provides a detailed breakdown of the most frequently restocked products. "Frequency" refers to the number of times a product has been restocked.
            </p>
          </div>

        </div>

        <div className='graphs-container graph-shadow' id='graph-container-least-frequently-restocked'>
          <div className='graphs-header'>
            <h3 className='reports-inventory-graph-title'>Least Frequently Restocked Products (Top 5)</h3>
            <GraphsImageDownloader elementId='graph-container-least-frequently-restocked' />
          </div>
          <div className='graphs-container__chart-wrapper' style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer>
              <ComposedChart
                width={500}
                height={400}
                data={leastRestockedProductsData}
                margin={{
                  top: 30,
                  right: 20,
                  bottom: 20,
                  left: 5,
                }}
              >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="name" scale="band" angle={-20} 
                  tick={({ x, y, payload }) => {
                    const label = truncateLabel(payload.value, 14);  // Truncate label
                    return (
                      <text x={x} y={y} textAnchor="middle" fontSize={14} dy={10}>
                        {label}
                      </text>
                    );
                  }}
                />
                <YAxis tick={{ fontSize: 14 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="frequency" barSize={60} fill="#413ea0" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className='graph-container__table'>
            <h4>Least Frequently Restocked Products Table</h4>
              <table className='graph-table'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    leastRestockedProductsData.map((items, index) => (
                      <tr key={index}>
                        <td>{items.name}</td>
                        <td>{items.frequency}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
          </div>

          <div className='graph-container__description'>
            <p>
              This chart provides a detailed breakdown of the least frequently restocked products. "Frequency" refers to the number of times a product has been restocked.
            </p>
          </div>    
          
        </div>

      </div>

    </div>
  )
}




export const ReportsInventoryYearly = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [mostRestockedProductsData, setMostRestockedProductsData] = useState([]);
  const [leastRestockedProductsData, setLeastRestockedProductsData] = useState([]);
  const [turnoverRatio, setTurnoverRatio] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Intl.DateTimeFormat('default', { year:'numeric' }).format(new Date()));

  const handleYearChange = (selectedYear) => {
    const formattedYear = new Intl.DateTimeFormat('default', {year:'numeric'}).format(selectedYear)
    setSelectedYear(formattedYear);
  }

  useEffect(() => {
    fetchMostRestockedProducts();
    fetchLeastRestockedProducts();
    getTurnoverRatio();
  },[selectedYear])


  const fetchMostRestockedProducts = () => {
    // Fetch data from the PHP script with the selectedDate
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getMostRestockedProductsYearly.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedYear: selectedYear }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const formattedData = data.map(item => ({
            name: item.productName,
            frequency: item.restockFrequency,
          }));
          setMostRestockedProductsData(formattedData);
        } else {
          setMostRestockedProductsData([]);
        }
      })
      .catch(error => {
        ToastError('Error fetching data:', error);
      });
  }


  const fetchLeastRestockedProducts = () => {
    // Fetch data from the PHP script with the selectedDate
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getLeastRestockedProductsYearly.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedYear: selectedYear }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const formattedData = data.map(item => ({
            name: item.productName,
            frequency: item.restockFrequency,
          }));
          setLeastRestockedProductsData(formattedData);
        } else {
          setLeastRestockedProductsData([]);
        }
      })
      .catch(error => {
        ToastError('Error fetching data:', error);
      });
  }

  const getTurnoverRatio = () => {
    fetch(`${apiUrl}/KampBJ-api/server/dataAnalysis/getTurnoverRatio.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: selectedYear }),
    })
      .then(response => response.json())
      .then(data => {
        if(data.length > 0){
          setTurnoverRatio(data); // Assuming you use useState to manage chart data
        }else{
          setTurnoverRatio([]); // Assuming you use useState to manage chart data
        }
        
      })
      .catch(error => console.error('Error fetching gross margin data:', error));
                  
  }
    
  const truncateLabel = (label, maxLength ) => {
    if (label.length > maxLength) {
      return `${label.slice(0, maxLength)}...`;
    }
    return label;
  };

  return(
    <div className='reports-inventory-component'>
      <div className='reports-inventory-component__header'>
        <YearSelection 
          onChange={handleYearChange}
          displayDate={selectedYear}
        />

        <GeneratePdf 
          elementId='graphs-container' 
          date={selectedYear} 
          reportTitle='Inventory Report'
          elementGraphsTable='graph-container__table' 
          elementsGraphsDescription='graph-container__description'
          elementGraphWrapper='graphs-container__chart-wrapper'
          graphWrapperHeight='300px'
        />
      </div>

      <div className='reports-inventory-component__body'>

        <div className='graphs-container graph-shadow' id='graph-container-inventory-ratio'>
          <div className='graphs-header'>
            <h3 className='reports-inventory-graph-title'>Highest Inventory Turn Over Ratio</h3>
            <GraphsImageDownloader elementId='graph-container-inventory-ratio' />
          </div>
          <div className='graphs-container__chart-wrapper' style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="91%">
              <AreaChart
                width={500}
                height={400}
                data={turnoverRatio}
                margin={{
                  top: 30,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" dy={5} tick={{ fontSize: 14 }} />
                <YAxis tick={{ fontSize: 14 }}/>
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Inventory_Turnover_Ratio" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className='graph-container__table'>
            <h4>Highest Inventory Turn Over ratio Table</h4>
              <table className='graph-table'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    turnoverRatio.map((items, index) => (
                      <tr key={index}>
                        <td>{items.productName}</td>
                        <td>{items.Inventory_Turnover_Ratio}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
          </div>

          <div className='graph-container__description'>
            <p>
            </p>
          </div>   
          
        </div>

        <div className='graphs-container graph-shadow' id='graph-container-most-frequently-restocked'>
          <div className='graphs-header'>
            <h3 className='reports-inventory-graph-title'>Most Frequently Restocked Products (Top 5)</h3>
            <GraphsImageDownloader elementId='graph-container-most-frequently-restocked'/>
          </div>
          <div className='graphs-container__chart-wrapper' style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer>
              <ComposedChart
                width={500}
                height={400}
                data={mostRestockedProductsData}
                margin={{
                  top: 30,
                  right: 20,
                  bottom: 20,
                  left: 5,
                }}
              >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="name" scale="band" angle={-20} 
                  tick={({ x, y, payload }) => {
                    const label = truncateLabel(payload.value, 14);  // Truncate label
                    return (
                      <text x={x} y={y} textAnchor="middle" fontSize={14} dy={10}>
                        {label}
                      </text>
                    );
                  }}
                />
                <YAxis tick={{ fontSize: 14 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="frequency" barSize={60} fill="#413ea0" />
              </ComposedChart>
            </ResponsiveContainer>    
          </div>   
          
          <div className='graph-container__table'>
            <h4>Most Frequently Restocked Products Table</h4>
              <table className='graph-table'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    mostRestockedProductsData.map((items, index) => (
                      <tr key={index}>
                        <td>{items.name}</td>
                        <td>{items.frequency}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
          </div>

          <div className='graph-container__description'>
            <p>
              This chart illustrates the inventory turnover ratios for each product in the selected timeframe. The inventory turnover ratio is a key performance indicator that measures how quickly a product is sold and replaced within a given period. A higher ratio indicates that products are being sold quickly, while a lower ratio may suggest slow-moving inventory.
            </p>
          </div>
        </div>

        <div className='graphs-container graph-shadow' id='graph-container-least-frequently-restocked'>
          <div className='graphs-header'>
            <h3 className='reports-inventory-graph-title'>Least Frequently Restocked Products (Top 5)</h3>
            <GraphsImageDownloader elementId='graph-container-least-frequently-restocked' />
          </div>
          <div className='graphs-container__chart-wrapper' style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer>
              <ComposedChart
                width={500}
                height={400}
                data={leastRestockedProductsData}
                margin={{
                  top: 30,
                  right: 20,
                  bottom: 20,
                  left: 5,
                }}
              >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="name" scale="band" angle={-20} 
                  tick={({ x, y, payload }) => {
                    const label = truncateLabel(payload.value, 14);  // Truncate label
                    return (
                      <text x={x} y={y} textAnchor="middle" fontSize={14} dy={10}>
                        {label}
                      </text>
                    );
                  }}
                />
                <YAxis tick={{ fontSize: 14 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="frequency" barSize={60} fill="#413ea0" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>   
          
          <div className='graph-container__table'>
            <h4>Least Frequently Restocked Products Table</h4>
              <table className='graph-table'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    leastRestockedProductsData.map((items, index) => (
                      <tr key={index}>
                        <td>{items.name}</td>
                        <td>{items.frequency}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
          </div>
          
          <div className='graph-container__description'>
            <p>
              This chart provides a detailed breakdown of the least frequently restocked products. "Frequency" refers to the number of times a product has been restocked.
            </p>
          </div> 
          

        </div>

      </div>
    </div>
  )
}