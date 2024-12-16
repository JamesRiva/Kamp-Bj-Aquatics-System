import React, { useRef, useState, useEffect } from 'react';
import '../Styles/Sales.css';
import ProductListModal from '../UIComponents/ProductListModal';
import ButtonComponent from '../UIComponents/ButtonComponent';
import LoadingState from '../UIComponents/LoadingState';

const Sales = () => {
    const [loading, setLoading] = useState(false);
    const [isFilterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const filterDropdownRef = useRef(null);
    const [productList, setProductList] = useState([]);
    const [isProductListModalOpen, setIsProductListModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // New state for search term
    const [filters, setFilters] = useState({
        filterBy: '',
        startDate: '',
        endDate: '',
    });
    const apiUrl = process.env.REACT_APP_API_URL;

    // Toggle Dropdowns
    const toggleFilterDropdown = () => {
        setFilterDropdownOpen(!isFilterDropdownOpen);
    }

    // Fetch sales records from the server
    const fetchSalesData = async () => {
        setLoading(true);

        try {
            const response = await fetch(`${apiUrl}/KampBJ-api/server/fetchSalesRecord.php`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const formattedData = data.map(sale => ({
                id: sale.salesId,
                date: sale.date,
                total: sale.total,
                username: sale.username
            }));
            setSalesData(formattedData);
        } catch (error) {
            console.error('Error fetching sales data:', error);
        }   finally {
            setLoading(false);
        }
    };

    // Fetch sales data when the component mounts
    useEffect(() => {
        fetchSalesData();
    }, []);

    // Handle Closing of Dropdowns When Clicked Outside of Its Div
    useEffect(() => {
        const handler = (e) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
                setFilterDropdownOpen(false);
            }
        };
        document.addEventListener('click', handler);

        return () => document.removeEventListener('click', handler);
    }, []);

    const handleShowProducts = async (salesId) => {  
        try {
            const response = await fetch(`${apiUrl}/KampBJ-api/server/fetchSalesProducts.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ salesId }) // Ensure this is being sent correctly
            });

            const data = await response.json();

            if (data.success === false) {
                console.error(data.message); // Log the error message
            } else {
                setProductList(data); // Assuming data contains the list of products
            }
            setSelectedTransaction(salesId);
            setIsProductListModalOpen(true);
        } catch (error) {
            console.error('Error fetching products for this sale:', error);
        }
    };
    
     // Filter and sort sales data based on search term, date, and total
    const filteredSalesData = salesData
    .filter(sale => {
        // Check if the sale matches the search term (ID or username)
        const matchesSearch = sale.id.toString().includes(searchTerm) || 
            sale.username.toLowerCase().includes(searchTerm.toLowerCase());

        // Check if the sale falls within the date range (if specified)
        const saleDate = new Date(sale.date);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;

        const matchesDate = (!startDate || saleDate >= startDate) && 
            (!endDate || saleDate <= endDate);

        return matchesSearch && matchesDate;
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

    const resetFilters = () => {
        setFilters({
            filterBy: '',
            startDate: '',
            endDate: '',
        });
    };

    return (
        <div className='sales'>
            <div className='sales__header'>
                <div className='sales__left-controls-wrapper'>
                <div className='sales__search-wrapper'>
                        <input
                            type='text'
                            placeholder='Search ID or facilitator'
                            className='sales__input-field'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
                        />
                    </div>
                    <div className='sales__filter-wrapper' title='Filter' ref={filterDropdownRef}>
                        <i className="sales__filter-icon fa-solid fa-filter" onClick={toggleFilterDropdown}></i>
                        {isFilterDropdownOpen &&
                            <div className='sales__filter-dropdown'>
                                <div className='sales__filter-dropdown-body'>
                                    <div className='sales__filter-dropdown-field-wrapper'>
                                        <p className='sales__filter-label'>Filter by</p>
                                        <select value={filters.filterBy}
                                            onChange={(e) => setFilters({ ...filters, filterBy: e.target.value })}
                                            className='sales__filter-field'
                                        >
                                            <option></option>
                                            <option value='total_high'>Total (Highest - Lowest)</option>
                                            <option value='total_low'>Total (Lowest - Highest)</option>
                                        </select>
                                    </div>
                                    <div className='sales__filter-dropdown-field-wrapper'>
                                        <p className='sales__filter-label'>Starting Date</p>
                                        <input type='date' value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className='sales__filter-field' />
                                        <p className='sales__filter-label'>To</p>
                                        <input type='date' value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className='sales__filter-field' />
                                    </div>
                                </div>
                                <div className='sales__filter-dropdown-footer'>
                                    <p className='sales__filter-reset' onClick={resetFilters}>Reset Filters</p>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div className='sales__body'>
                <div className='sales__table-wrapper'>
                    <table className='sales__table'>
                        <thead>
                            <tr>
                                <th className='sales__table-th'>Sales ID</th>
                                <th className='sales__table-th'>Date</th>
                                <th className='sales__table-th'>Total</th>
                                <th className='sales__table-th'>Facilitated By</th>
                                <th className='sales__table-th'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSalesData.map((sales) =>
                                <tr className='sales__table-tr' key={sales.id} >
                                    <td className='sales__table-td'>{sales.id}</td>
                                    <td className='sales__table-td'>{sales.date}</td>
                                    <td className='sales__table-td'>
                                    ₱ {Number(sales.total).toLocaleString(undefined, { 
                                            minimumFractionDigits: 2, 
                                            maximumFractionDigits: 2 
                                        })}
                                    </td>
                                    <td className='sales__table-td'>{sales.username}</td>
                                    <td className='sales__table-td'>
                                        <ButtonComponent label='Show' onClick={() => handleShowProducts(sales.id)} />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <ProductListModal
                isOpen={isProductListModalOpen}
                onClose={() => setIsProductListModalOpen(false)}
                title={'Sales'}
                selectedTransaction = {selectedTransaction}
                productList={productList} // Pass productList as prop   
            />

            {loading && <LoadingState />}
        </div>
    )
}

export default Sales;
