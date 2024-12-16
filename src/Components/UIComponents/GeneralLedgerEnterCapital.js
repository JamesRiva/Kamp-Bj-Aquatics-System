import React, { useEffect, useState } from 'react';
import '../Styles/Modal.css';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import * as Yup from 'yup';
import LoadingState from '../UIComponents/LoadingState';
import { ToastError, ToastSuccess } from '../UIComponents/ToastComponent';


const GeneralLedgerEnterCapital = ({ onClick, fetchSalesAndExpenses }) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [loading, setLoading] = useState(false);
    // Initial Values 
    const initialValues = {
        capital: ''
    };

    // Validation
    const validationSchema = Yup.object({
        capital: Yup.number()
            .required('Capital is required'),
    });

    const insert = async (values, { resetForm }) => {
        const defaultDate = new Date().toISOString().split('T')[0];
        setLoading(true);

        fetch(`${apiUrl}/KampBJ-api/server/insertCapital.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ capital: values.capital, date: defaultDate }),
        })
        .then(response => response.json())
        .then(data => {
            if(data.success){
                ToastSuccess(data.success);
                resetForm();
                fetchSalesAndExpenses();
                onClick();
            }else {
                ToastError(data.error);
            }
        })
        .catch(error => {
            ToastError('Error fetching data:', error);
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
                    <Formik initialValues={initialValues} onSubmit={insert} validationSchema={validationSchema}>
                        {() => (
                            <Form className='modal__form'>
                                <div className='modal__input-field-wrapper'>
                                    <Field type='number' step="0.01" name='capital' placeholder='Enter Capital' className='modal__input-field' />
                                    <ErrorMessage name='capital' component='span' className='modal__input-field-error' />
                                </div>
                                <button type='submit' className='modal__insert'>Insert Capital</button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>

            {loading && <LoadingState />}
        </div>
  )
}

export default GeneralLedgerEnterCapital
