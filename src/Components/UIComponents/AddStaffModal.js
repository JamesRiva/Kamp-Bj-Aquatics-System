import React, { useEffect, useState } from 'react';
import '../Styles/Modal.css';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import * as Yup from 'yup';
import { ToastSuccess, ToastError } from '../UIComponents/ToastComponent';
import LoadingState from '../UIComponents/LoadingState';

const AddStaffModal = ({ onClick, selectedUser, refresh }) => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch roles from the server
  useEffect(() => {
    fetch(`${apiUrl}/KampBJ-api/server/getRole.php`)
      .then(response => response.json())
      .then(data => {
        if (data.roles) {
          setRoles(data.roles);
        } else {
          console.error('Failed to fetch roles');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);

  // Initial Values 
  const initialValues = {
    role: '',
    salary: '0',
  };

  // Validation schema
  const validationSchema = Yup.object({
    role: Yup.string().required('Role is required'),
  });

  const insert = (values, { resetForm }) => {
    const selectedRole = roles.find((role) => role.roleTitle === values.role);

    const formData = new FormData();
    formData.append('userId', localStorage.getItem('userId'));
    formData.append('requestId', selectedUser.requestId);
    formData.append('roleId', selectedRole.roleId);
    formData.append('username', selectedUser.username );
    formData.append('salary', initialValues.salary);
    formData.append('fullname', selectedUser.fullname );
    formData.append('age', selectedUser.age);
    formData.append('email', selectedUser.email);
    formData.append('contactNum', selectedUser.contactNum);
    formData.append('gender', selectedUser.gender);
    formData.append('address', selectedUser.address);
    formData.append('password', selectedUser.password);
    formData.append('image', selectedUser.image);
    
    setLoading(true);

    fetch(`${apiUrl}/KampBJ-api/server/insertNewUser.php`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          ToastSuccess('New Staff Record Created Successfully');
          resetForm();
          onClick();
          refresh();
        }
      })
      .catch((error) => {
        ToastError('Error adding product', error);
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
                {/* Role selection using datalist */}
                <div className='modal__input-field-wrapper'>
                  <Field list='roles' id='role' name='role' className='modal__input-field' placeholder='Select role' />
                  <datalist id='roles'>
                    {roles.map(role => (
                      <option key={role.roleId} value={role.roleTitle}></option>
                    ))}
                  </datalist>

                  <ErrorMessage name='role' component='div' className='modal__input-field-error' />
                </div>
                <button type='submit' className='modal__insert'>Approve</button>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {loading && <LoadingState />}
    </div>
  );
};

export default AddStaffModal;
