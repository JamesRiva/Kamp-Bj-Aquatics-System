import React, { useState, useRef, useEffect } from 'react';
import '../Styles/Inventory.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StatusNotifier from '../UIComponents/StatusNotifier';
import StatusLegend from '../UIComponents/StatusLegend';
import { ViewProductIcon } from '../UIComponents/ActionIcons';

const Inventory = () => {
  const [isFilterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  // State for fetched inventory data
  const [inventoryData, setInventoryData] = useState([]);

  // State for filtered and sorted inventory data
  const [filteredInventory, setFilteredInventory] = useState([]);

  // State for search input
  const [searchTerm, setSearchTerm] = useState('');

  // State for filters
  const [filters, setFilters] = useState({
    sortBy: '', // Sorting criteria
  });

  // Fetch inventory data from PHP script when the component mounts
  useEffect(() => {
    fetch('http://localhost/KampBJ-api/server/fetchInventoryProducts.php') // Update with your actual URL
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setInventoryData(data.data); // Update state with fetched data
          setFilteredInventory(data.data); // Initialize filtered inventory
        } else {
          toast.error('No products available');
        }
      })
      .catch(error => {
        console.error('Error fetching inventory:', error);
        toast.error('Error connecting to the server');
      });
  }, []); // Runs once when the component mounts

  // Filter and sort inventory based on search term and sort option
  useEffect(() => {
    let filtered = inventoryData.filter(item =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort filtered inventory based on selected option
    if (filters.sortBy === 'priceAsc') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'priceDesc') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'stocksAsc') {
      filtered = filtered.sort((a, b) => a.quantity - b.quantity);
    } else if (filters.sortBy === 'stocksDesc') {
      filtered = filtered.sort((a, b) => b.quantity - a.quantity);
    }

    setFilteredInventory(filtered);
  }, [searchTerm, filters.sortBy, inventoryData]);

  // Toggle Filter Dropdown
  const toggleFilterDropdown = () => {
    setFilterDropdownOpen(!isFilterDropdownOpen);
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handler = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
    };
  }, []);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      sortBy: '', // Reset sorting
    });
    setSearchTerm(''); // Optionally reset search term
  };

  return (
    <div className='inventory'>
      <div className='inventory__header'>
        <div className='inventory__search-wrapper'>
          <input 
            type='text' 
            placeholder='Search Name, Brand, or Model' 
            className='inventory__input-field' 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className='inventory__filter-wrapper' ref={filterDropdownRef}>
          <i className="inventory__filter-icon fa-solid fa-filter" onClick={toggleFilterDropdown}></i>
          {isFilterDropdownOpen && (
            <div className="inventory__filter-dropdown">
              <div className="inventory__filter-dropdown-body">
                <div className="inventory__filter-dropdown-field-wrapper">
                  <p className="inventory__filter-label">Sort by</p>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="inventory__filter-field"
                  >
                    <option value="">Select</option>
                    <option value="priceAsc">Price (Lowest - Highest)</option>
                    <option value="priceDesc">Price (Highest - Lowest)</option>
                    <option value="stocksAsc">Stocks (Lowest - Highest)</option>
                    <option value="stocksDesc">Stocks (Highest - Lowest)</option>
                  </select>
                </div>
              </div>
              <div className="inventory__filter-dropdown-footer">
                <p className="inventory__filter-reset" onClick={resetFilters}>Reset Filters</p>
              </div>
            </div>
          )}
        </div>
        <StatusLegend customClass='inventory__status-legend' />
      </div>

      <div className='inventory__body'>
        <div className='inventory__table-wrapper'>
          <table className='inventory__table'>
            <thead>
              <tr>
                <th className='inventory__table-th'>Name</th>
                <th className='inventory__table-th'>Category</th>
                <th className='inventory__table-th'>Brand</th>
                <th className='inventory__table-th'>Model</th>
                <th className='inventory__table-th'>Stocks</th>
                <th className='inventory__table-th'>Price</th>
                <th className='inventory__table-th'>Status</th>
                <th className='inventory__table-th'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((inventoryItem) => (
                  <tr className='inventory__table-tr' key={inventoryItem.productId}>
                    <td className='inventory__table-td'>{inventoryItem.productName}</td>
                    <td className='inventory__table-td'>{inventoryItem.category}</td>
                    <td className='inventory__table-td'>{inventoryItem.brand}</td>
                    <td className='inventory__table-td'>{inventoryItem.model}</td>
                    <td className='inventory__table-td'>{inventoryItem.quantity}</td>
                    <td className='inventory__table-td'>{inventoryItem.sellingPrice}</td>
                    <td className='inventory__table-td'>
                      <StatusNotifier stocks={inventoryItem.quantity} lowStockIndicator={inventoryItem.lowStockIndicator}/>
                    </td>
                    <td className='inventory__table-td'>
                      <ViewProductIcon products={inventoryItem} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="inventory__table-td">No products available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
