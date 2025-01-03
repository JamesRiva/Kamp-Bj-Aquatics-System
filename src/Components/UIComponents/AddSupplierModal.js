import React, { useState, useEffect } from 'react';
import '../Styles/Modal.css';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import * as Yup from 'yup';
import CheckboxGroup from './CheckboxGroup';
import { ToastSuccess, ToastError } from './ToastComponent';
import LoadingState from '../UIComponents/LoadingState';

const AddSupplierModal = ({ onClick, fetchSuppliers, supplierData }) => {
  const [loading, setLoading] = useState(false);
  const [categoriesData, setCategoriesData] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch categories from the API on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${apiUrl}/KampBJ-api/server/fetchCategories.php`);
        const data = await response.json();
        setCategoriesData(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const initialValues = {
    supplier: "",
    email: "",
    contact: "",
    location: "",
    categories: [] 
  };

  const validationSchema = Yup.object({
    supplier: Yup.string().required('Supplier is Required').matches(/^[a-zA-Z0-9\s]*$/, 'Special Chars are not Allowed'),
    email: Yup.string().required('Email is Required').email('Invalid Email'),
    contact: Yup.string().required('Contact is Required').matches(/^\d+$/, 'Only Numbers are Allowed').length(11, 'Contact must be exactly 11 digits'),
    location: Yup.string().required('Location is Required'),
    categories: Yup.array().min(1, 'At least one category must be selected')
  });

  const insert = async (values, { resetForm }) => {
    const supplierExists = supplierData.some(
      (supplier) => supplier.supplierName.toLowerCase() === values.supplier.toLowerCase()
    );

    if (supplierExists) {
      ToastError('Supplier already exists');
      return;
    }
    
    // Prepare data for form-urlencoded format
    const formData = new URLSearchParams();
    formData.append('supplier', values.supplier);
    formData.append('email', values.email);
    formData.append('contact', values.contact);
    formData.append('location', values.location);
    
    // Append category IDs as an array
    values.categories.forEach(categoryId => formData.append('categoryIds[]', categoryId));
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/KampBJ-api/server/insertSupplier.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(), // Send as form data
      });
      const data = await response.json();
  
      if (data.status === "success") {
        ToastSuccess('Successfully Added');
        resetForm();
        fetchSuppliers();
        onClick();
      } else {
        ToastError(data.message || 'Error adding supplier');
      }
    } catch (error) {
      console.error("Error inserting supplier:", error);
      ToastError('Error adding supplier');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className='modal'>
      <div className='modal__wrapper'>
        <i className="modal__close-icon fa-solid fa-xmark" onClick={onClick}></i>
        <div className='modal__body'>
          <Formik initialValues={initialValues} onSubmit={insert} validationSchema={validationSchema}>
            {({ errors, touched }) => (
              <Form className='modal__form'>
                <div className='modal__input-field-wrapper'>
                  <Field type='text' name='supplier' placeholder='Enter Supplier' className='modal__input-field'/>
                  <ErrorMessage name='supplier' component='span' className='modal__input-field-error' />
                </div>

                <div className='modal__input-field-wrapper'>
                  <Field type='email' name='email' placeholder='Enter Email' className='modal__input-field'/>
                  <ErrorMessage name='email' component='span' className='modal__input-field-error' />
                </div>

                <div className='modal__input-field-wrapper'>
                  <Field type='text' name='contact' placeholder='Enter Contact No.' className='modal__input-field'/>
                  <ErrorMessage name='contact' component='span' className='modal__input-field-error' />
                </div>

                <div className='modal__input-field-wrapper'>
                  <Field type='text' name='location' placeholder='Enter Location' className='modal__input-field'/>
                  <ErrorMessage name='location' component='span' className='modal__input-field-error' />
                </div>

                <div className='modal__input-field-wrapper'>
                  <CheckboxGroup
                    label="Product Categories:"
                    name="categories"
                    options={categoriesData.map(category => ({ label: category.name, value: category.categoryId }))}
                  />
                  {errors.categories && touched.categories ? (
                    <span className="modal__input-field-error">{errors.categories}</span>
                  ) : null}
                </div>

                <button type='submit' className='modal__insert'>Add Supplier</button>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {loading && <LoadingState />}
    </div>
  );
};

export default AddSupplierModal;
