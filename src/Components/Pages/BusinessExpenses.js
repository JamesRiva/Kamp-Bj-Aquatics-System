import React, { useRef, useState, useEffect } from 'react';
import '../Styles/BusinessExpenses.css';
import AddExpensesModal from '../UIComponents/AddExpensesModal';
import EditExpensesModal from '../UIComponents/EditExpensesModal';
import UpdateIcon from '../UIComponents/UpdateIcon';
import { ViewExpensesIcon } from '../UIComponents/ActionIcons';
import TextSlicer from '../Utils/TextSlicer';
import DatePicker from 'react-datepicker';
import LoadingState from '../UIComponents/LoadingState';
import ExpensesReminder from '../UIComponents/ExpensesReminder';

const BusinessExpenses = () => {
  const [loading, setLoading] = useState(false);
  const [isFilterDropdownOpen, isSetFilterDropdownOpen] = useState(false);
  const [isAddModalOpen, isSetAddModalOpen] = useState(false);
  const [isEditModalOpen, isSetEditModalOpen] = useState(false);
  const filterDropdownRef = useRef(null);
  const [expensesData, setExpensesData] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expensesReminder, setExpensesReminder] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Initial Values For Filters Store In useState
  const [filters, setFilters] = useState({
    filterBy: '',
    startDate: '',
    endDate: '',
  });

  // Fetch expense records on component mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/KampBJ-api/server/fetchExpenseRecords.php`);
      const data = await response.json();
      if (Array.isArray(data)) {
        
        const expenses = data.map(expense => ({
          ...expense,
          total: parseFloat(expense.total)
        }));

        setExpensesData(expenses);
      } else {
        console.error('Error fetching expenses:', data.message);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Dropdowns
  const toggleFilterDropdown = () => {
    isSetFilterDropdownOpen(!isFilterDropdownOpen);
  };

  const toggleAddModal = () => {
    isSetAddModalOpen(!isAddModalOpen);
  };

  const toggleEditModal = () => {
    isSetEditModalOpen(!isEditModalOpen);
  };

  // Inside the BusinessExpenses component
const handleEditClick = (expense) => {
  // Set the selected expense for editing
  setSelectedExpense(expense);
  toggleEditModal();
};

         // Filter and sort sales data based on search term, date, and total
         const filteredExpenseData = expensesData
         .filter(expense => {
             if (searchTerm) {
              // || 
              // expense.username.toLowerCase().includes(searchTerm.toLowerCase());
                 // Check if the restock matches the search term (ID or username)
                 const matchesSearch = expense.reference.toString().includes(searchTerm) 
                 if (!matchesSearch) return false;
             }
     
             // Check if the restock falls within the date range (if specified)
             const expenseDate = new Date(expense.date);
             const startDate = filters.startDate ? new Date(filters.startDate) : null;
             const endDate = filters.endDate ? new Date(filters.endDate) : null;

             const matchesDate = 
                 (!startDate || expenseDate >= startDate) && 
                 (!endDate || expenseDate <= endDate);
     
             return matchesDate;
         })
         .sort((a, b) => {
             if (filters.filterBy === 'total_high') {
                 return b.total - a.total; // Sort by total descending
             }
             if (filters.filterBy === 'total_low') {
                 return a.total - b.total; // Sort by total ascending
             }
             return 0; // No sorting applied
         });


  // Handle Closing of Dropdowns When Clicked Outside of Its Div
  useEffect(() => {
    const handler = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        isSetFilterDropdownOpen(false);
      }
    };
    document.addEventListener('click', handler);

    return () => document.removeEventListener('click', handler);
  }, []);

  // Reset Filters
  const resetFilters = () => {
    setFilters({
      filterBy: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleDateChange = (name, date) => {
    if (name === 'endDate' && date) {
      // Set end date to the last day of the selected month
      const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Last day of the selected month
      setFilters({
        ...filters,
        [name]: lastDayOfMonth,
      });
    } else {
      setFilters({
        ...filters,
        [name]: date,
      });
    }
  };
  

  return (
    <div className='business-expenses'>
      <div className='business-expenses__header'>
        <div className='business-expenses__left-controls-wrapper'>
          <div className='business-expenses__search-wrapper'>
            <input 
              type='text' 
              placeholder='Search reference Number' 
              className='business-expenses__input-field'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
          />
          </div>
          <div className='business-expenses__filter-wrapper' title='Filter' ref={filterDropdownRef}>
            <i className="business-expenses__filter-icon fa-solid fa-filter" onClick={toggleFilterDropdown}></i>
            {isFilterDropdownOpen && (
              <div className='business-expenses__filter-dropdown'>
                <div className='business-expenses__filter-dropdown-body'>
                  <div className='business-expenses__filter-dropdown-field-wrapper'>
                    <p className='business-expenses__filter-label'>Filter by</p>
                    <select 
                        className="restock-records__filter-field"
                        value={filters.filterBy}
                        onChange={(e) => setFilters({ ...filters, filterBy: e.target.value })}
                    >
                        <option value="">Select</option>
                        <option value="total_high">Total (Highest - Lowest)</option>
                        <option value="total_low">Total (Lowest - Highest)</option>
                    </select>
                  </div>
                  <div className='business-expenses__filter-dropdown-field-wrapper'>
                    <p className='business-expenses__filter-label'>Starting Date</p>
                    <DatePicker
                      selected={filters.startDate}
                      onChange={(date) => handleDateChange('startDate', date)}
                      dateFormat="yyyy-MM"
                      showMonthYearPicker
                      maxDate={new Date()}
                      placeholderText='Select A Month'
                      className='business-expenses__filter-field'
                    />
                    <p className='business-expenses__filter-label'>To</p>
                    <DatePicker
                      selected={filters.endDate}
                      onChange={(date) => handleDateChange('endDate', date)}
                      dateFormat="yyyy-MM"
                      showMonthYearPicker
                      maxDate={new Date()}
                      placeholderText='Select A Month'
                      className='business-expenses__filter-field'
                    />
                  </div>
                </div>
                <div className='business-expenses__filter-dropdown-footer'>
                  <p className='business-expenses__filter-reset' onClick={resetFilters}>Reset Filters</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='business-expenses__right-controls-wrapper'>
          <button className='business-expenses__insert'>
            <i className="business-expenses__insert-icon fa-solid fa-plus" title='Add Expenses' onClick={()=>setExpensesReminder(true)}></i>
          </button>
        </div>
      </div>

      <div className='business-expenses__body'>
        <div className='business-expenses__table-wrapper'>
          <table className='business-expenses__table'>
            <thead>
              <tr>
                <th className='business-expenses__table-th'>Title</th>
                <th className='business-expenses__table-th'>Reference Number</th>
                <th className='business-expenses__table-th'>Description</th>
                <th className='business-expenses__table-th'>Date</th>
                <th className='business-expenses__table-th'>Total</th>
                <th className='business-expenses__table-th'>Recorded By</th>
                <th className='business-expenses__table-th'></th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenseData.map((expense) => (
                <tr className='business-expenses__table-tr' key={expense.expenseId}>
                  <td className='business-expenses__table-td'>{expense.title}</td>
                  <td className='business-expenses__table-td'>{expense.reference}</td>
                  <td className='business-expenses__table-td'><TextSlicer text={expense.description} /></td>
                  <td className='business-expenses__table-td'>{new Date(expense.date).toLocaleDateString()}</td>
                  <td className='business-expenses__table-td'>
                  ₱ {Number(expense.total).toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                    })}
                  </td>
                  <td className='business-expenses__table-td'>{expense.username}</td>
                  <td className='business-expenses__table-td'>
                    <UpdateIcon onClick={() => handleEditClick(expense)} />
                    <ViewExpensesIcon expenses={expense} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isAddModalOpen && <AddExpensesModal onClick={toggleAddModal} refresh={fetchExpenses}/>}
      {isEditModalOpen && selectedExpense && <EditExpensesModal onClick={toggleEditModal} selectedExpense={selectedExpense} refresh={fetchExpenses} />}
      

      {expensesReminder && <ExpensesReminder proceed={() => { isSetAddModalOpen(true); setExpensesReminder(false) }} cancel={() => setExpensesReminder(false)} />}
      {loading && <LoadingState />}
    </div>
  );
};

export default BusinessExpenses;
