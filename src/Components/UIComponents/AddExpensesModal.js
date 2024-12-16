import React, { useState, useEffect } from 'react';
import '../Styles/Modal.css';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import * as Yup from 'yup';
import { ToastContainer } from 'react-toastify';
import DefaultImagePreview from '../Assets/image-preview.png';
import { ToastSuccess, ToastError } from '../UIComponents/ToastComponent';
import LoadingState from '../UIComponents/LoadingState';

const AddUtilitiesModal = ({ onClick, refresh }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(DefaultImagePreview);
  const [expenseTitles, setExpenseTitles] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  const initialValues = {
    receiptImage: "",
    description: "",
    total: "",
    date: "",
    expense: ""
  };

  const validationSchema = Yup.object({
    receiptImage: Yup.mixed().required('Receipt Image is required'),
    description: Yup.string().required('Description is required'),
    total: Yup.number().required('Total amount is required').positive('Amount must be positive'),
    date: Yup.date().required('Date is required'),
    expense: Yup.string().required('Expense type is required') // Add validation for expense type
  });

  useEffect(() => {
    // Fetch distinct expense titles when the component mounts
    fetch(`${apiUrl}/KampBJ-api/server/fetchExpenseTitles.php`) // Update with your actual endpoint
      .then(response => response.json())
      .then(data => {
        setExpenseTitles(data);
      })
      .catch(error => {
        console.error('Error fetching expense titles:', error);
      });
  }, []);

  const handleImageChange = (event, setFieldValue) => {
    const file = event.target.files[0];
    setFieldValue('receiptImage', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const insertExpense = (values, { resetForm }) => {
    const formData = new FormData();
    formData.append('userId', localStorage.getItem('userId'));
    formData.append('receiptImage', values.receiptImage);
    formData.append('reference', values.reference);
    formData.append('description', values.description);
    formData.append('total', values.total);
    formData.append('date', values.date);
    formData.append('expense', values.expense);

    setLoading(true);

    fetch(`${apiUrl}/KampBJ-api/server/insertExpense.php`, {
      method: 'POST',
      body: formData,
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        ToastSuccess('Expense Added');
        resetForm();
        onClick();
        setImagePreview(DefaultImagePreview);
        refresh();
      } else {
        ToastError('Failed to add expense');
      }
    })
    .catch((error) => {
      console.error('Error inserting expense:', error);
      ToastError('Error adding expense');
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className='modal'>
      <div className='modal__wrapper'>
        <i className="modal__close-icon fa-solid fa-xmark" onClick={onClick}></i>
        <div className='modal__body'>
          <Formik initialValues={initialValues} onSubmit={insertExpense} validationSchema={validationSchema}>
            {({ setFieldValue }) => (
              <Form className='modal__form'>

                <div className='modal__input-field-wrapper'>
                  <div className='modal__image-preview-wrapper'>
                    <img src={imagePreview} alt="Receipt Preview" className='modal__image-preview' />
                  </div>

                  <input
                    type='file'
                    name='receiptImage'
                    accept='image/jpg, image/jpeg, image/png'
                    onChange={(event) => handleImageChange(event, setFieldValue)}
                    id='fileInput'
                    className='modal__image-input'
                  />

                  <ErrorMessage name='receiptImage' component='span' className='modal__input-field-error' />
                </div>

                <div className='modal__input-field-wrapper'>
                  <Field as='input' list='expenses-list' name='expense' placeholder='Enter Expense Type' className='modal__input-field' />
                  <datalist id='expenses-list'>
                    {expenseTitles.map((title, index) => (
                      <option key={index} value={title} />
                    ))}
                  </datalist>
                  <ErrorMessage name='expense' component='span' className='modal__input-field-error' />
                </div>

                <div className='modal__input-field-wrapper'>
                  <Field type='text' name='reference' placeholder='Reference Number' className='modal__input-field' />
                  <ErrorMessage name='reference' component='span' className='modal__input-field-error' />
                </div>

                <div className='modal__input-field-wrapper'>
                  <Field type='text' name='description' placeholder='Description' className='modal__input-field' />
                  <ErrorMessage name='description' component='span' className='modal__input-field-error' />
                </div>

                <div className='modal__input-field-wrapper'>
                  <Field type='number' name='total' placeholder='Total Amount' className='modal__input-field' />
                  <ErrorMessage name='total' component='span' className='modal__input-field-error' />
                </div>

                <div className='modal__input-field-wrapper'>
                  <Field type='date' name='date' className='modal__input-field' />
                  <ErrorMessage name='date' component='span' className='modal__input-field-error' />
                </div>

                <button type='submit' className='modal__insert'>Add Expense</button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <ToastContainer />
      

      {loading && <LoadingState />}
    </div>
  );
};

export default AddUtilitiesModal;
