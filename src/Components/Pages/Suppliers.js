import React, { useState, useEffect } from 'react';
import '../Styles/Suppliers.css';
import AddSupplierModal from '../UIComponents/AddSupplierModal';
import EditSupplierModal from '../UIComponents/EditSupplierModal';
import UpdateIcon from '../UIComponents/UpdateIcon';
import { ToastContainer, toast } from 'react-toastify';
import LoadingState from '../UIComponents/LoadingState';

const Suppliers = () => {
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [supplierData, setSupplierData] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;

  const toggleAddModal = () => setAddModalOpen(!isAddModalOpen);
  const toggleEditModal = (supplier = null) => {
    setSelectedSupplier(supplier);
    setEditModalOpen(!!supplier); 
  };
  
    // Filter suppliers by name or category
    const filteredSupplierData = supplierData
    .filter(supplier => {
      if (searchTerm) {
        const matchesSupplierName = supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategories = supplier.categories.some(category => category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesLocation = supplier.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSupplierName || matchesCategories || matchesLocation; // Match either supplier name or categories
      }
      return true;
    });


  const fetchSuppliers = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/KampBJ-api/server/fetchSupplier.php`);
      const data = await response.json();
      if (data.status === 'success') {
        setSupplierData(data.suppliers);
      } else {
        toast.error("Failed to fetch suppliers");
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error("Error fetching suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);


  return (
    <div className='suppliers'>
      <div className='suppliers__header'>
        <div className='suppliers__left-controls-wrapper'>
          <div className='suppliers__search-wrapper'>
            <input type='text' placeholder='Search Supplier, Categories or Location' value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}  className='suppliers__input-field' />
          </div>
        </div>
        <div className='suppliers__right-controls-wrapper'>
          <button className='suppliers__insert' onClick={toggleAddModal}>
            <i className="suppliers__insert-icon fa-solid fa-plus" title='Add Supplier'></i>
          </button>
          {isAddModalOpen && <AddSupplierModal onClick={toggleAddModal} fetchSuppliers={fetchSuppliers} supplierData={supplierData} />}
        </div>
      </div>
      <div className='suppliers__body'>
        <div className='suppliers__table-wrapper'>
          <table className='suppliers__table'>
            <thead>
              <tr>
                <th className='suppliers__table-th'>Supplier</th>
                <th className='suppliers__table-th'>Goods Supplied (Categories)</th>
                <th className='suppliers__table-th'>Email</th>
                <th className='suppliers__table-th'>Contact</th>
                <th className='suppliers__table-th'>Location (City)</th>
                <th className='suppliers__table-th'></th>
              </tr>
            </thead>
            <tbody>
              {filteredSupplierData.map((supplier) => (
                <tr className='suppliers__table-tr' key={supplier.supplierId}>
                  <td className='suppliers__table-td'>{supplier.supplierName}</td>
                  <td className='suppliers__table-td'>
                    {supplier.categories.length > 0
                      ? supplier.categories.map(category => category.categoryName).join(', ')
                      : 'No categories'}
                  </td>
                  <td className='suppliers__table-td'>{supplier.email}</td>
                  <td className='suppliers__table-td'>{supplier.contactNum}</td>
                  <td className='suppliers__table-td'>{supplier.location}</td>
                  <td className='suppliers__table-td'>
                    <UpdateIcon onClick={() => toggleEditModal(supplier)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isEditModalOpen && selectedSupplier && (
        <EditSupplierModal 
        onClick={toggleEditModal} 
        supplierData={selectedSupplier} 
        fetchSuppliers={fetchSuppliers}
        supplierDataArray={supplierData}
      />
      )}

      <ToastContainer />
      {loading && <LoadingState />}
    </div>
  );
};

export default Suppliers;
