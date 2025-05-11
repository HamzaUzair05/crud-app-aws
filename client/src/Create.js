import React from 'react';
import { Form, FormGroup, FormControl, ControlLabel, Modal, Button } from 'rsuite';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import './App.css';

class Create extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        formValue: {
          ime: '',
          prezime: '',
          email: '',
          telefon: '',
          adresa: '',
          linkedin: '',
          skype: '',
          instagram: '',
          datumRodjenja: '',
          jmbg: ''
        },
        show: false
      };
      this.close = this.close.bind(this);
      this.open = this.open.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.updateData = this.updateData.bind(this);
    }
    close() {
      this.setState({ show: false });
    }
    open() {
      this.setState({ show: true });
    }
    handleChange(value) {
      this.setState({
        formValue: value
      });
    }

    updateData() { 
      var handleToUpdate = this.props.handleToUpdate;
      this.props.data.push({
        "Ime" : this.state.formValue.ime,
        "Prezime" : this.state.formValue.prezime,
        "Email" : this.state.formValue.email,
        "Telefon" : this.state.formValue.telefon,
        "Adresa" : this.state.formValue.adresa,
        "Linkedin" : this.state.formValue.linkedin,
        "Skype" : this.state.formValue.skype,
        "Instagram" : this.state.formValue.instagram,
        "Datum_rodjenja" : this.state.formValue.datumRodjenja,
        "JMBG" : this.state.formValue.jmbg
      });  
      handleToUpdate(this.props.data);
    }
    resetForm() {
      this.setState({
        formValue: {
          ime: '',
          prezime: '',
          email: '',
          telefon: '',
          adresa: '',
          linkedin: '',
          skype: '',
          instagram: '',
          datumRodjenja: '',
          jmbg: ''
        }
      });
    }
    
    handleSubmit = (event) => {
      event.preventDefault();
      
      console.log('Submitting form with data:', this.state.formValue);
      
      // Validate date format if provided
      if (this.state.formValue.datumRodjenja && !/^\d{4}-\d{2}-\d{2}$/.test(this.state.formValue.datumRodjenja)) {
        alert('Please enter date in YYYY-MM-DD format (e.g., 1990-01-31)');
        return;
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to create contacts');
        return;
      }
      
      fetch('/api/auth/post', {
          method: 'POST',
          body: JSON.stringify(this.state.formValue),
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token  // Add the token to the request headers
          }
        })
        .then(res => {
          console.log('Response status:', res.status);
          if (!res.ok) {
            if (res.status === 401) {
              throw new Error('Authentication failed. Please log in again.');
            }
            return res.json().then(err => {
              throw new Error(err.msg || 'Failed to create contact');
            });
          }
          return res.text();
        })
        .then(res => {
          console.log('Success response:', res);
          this.close();
          this.updateData();
          this.resetForm();
        })
        .catch(err => {
          console.error('Fetch error:', err);
          alert(err.message || 'Error creating contact');
        });
    }

    render() {
      return (
        <React.Fragment>
          <Modal show={this.state.show} onHide={this.close} size="md">
            <Modal.Header>
              <Modal.Title>New User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                fluid
                onChange={this.handleChange}
                formValue={this.state.formValue}
              >
                <FormGroup>
                  <ControlLabel>First Name</ControlLabel>
                  <FormControl name="ime" />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Last Name</ControlLabel>
                  <FormControl name="prezime"/>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Email</ControlLabel>
                  <FormControl name="email" type="email"/>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Phone</ControlLabel>
                  <FormControl name="telefon" />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Address</ControlLabel>
                  <FormControl name="adresa" />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>LinkedIn</ControlLabel>
                  <FormControl name="linkedin" />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Skype</ControlLabel>
                  <FormControl name="skype" />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Instagram</ControlLabel>
                  <FormControl name="instagram" />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Date of Birth</ControlLabel>
                  <FormControl name="datumRodjenja" />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>ID Number</ControlLabel>
                  <FormControl name="jmbg" />
                </FormGroup>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.handleSubmit} appearance="primary">
                Create
              </Button>
              <Button onClick={this.close} appearance="subtle">
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
          <PersonAddIcon className="hvr-grow" onClick={this.open}>Novi korisnik</PersonAddIcon>
        </React.Fragment>
      );
    }
  }
  
export default Create;