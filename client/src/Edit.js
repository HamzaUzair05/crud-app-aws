import React from 'react';
import { Form, FormGroup, FormControl, ControlLabel, Modal, Button } from 'rsuite';
import EditIcon from '@material-ui/icons/Edit';
import './App.css';

class Edit extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        data:  this.props.data,
        formValue: {
            ime: this.props.details.Ime,
            prezime: this.props.details.Prezime,
            email: this.props.details.Email,
            telefon: this.props.details.Telefon,
            adresa: this.props.details.Adresa,
            linkedin: this.props.details.Linkedin,
            skype: this.props.details.Skype,
            instagram: this.props.details.Instagram,
            datumRodjenja: this.props.details.Datum_rodjenja,
            jmbg: this.props.details.JMBG
        },
        show: false,
        

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
      this.setState({
        formValue: {
          ime: this.props.details.Ime,
          prezime: this.props.details.Prezime,
          email: this.props.details.Email,
          telefon: this.props.details.Telefon,
          adresa: this.props.details.Adresa,
          linkedin: this.props.details.Linkedin,
          skype: this.props.details.Skype,
          instagram: this.props.details.Instagram,
          datumRodjenja: this.props.details.Datum_rodjenja,
          jmbg: this.props.details.JMBG
        }
      })
    }
    handleChange(value) {
      this.setState({
        formValue: value
      });
    }

    updateData() { 
      var handleToUpdate = this.props.handleToUpdate;
      for( var i =0; i < this.props.data.length; i++) { 
        if( this.props.data[i].JMBG === this.state.formValue.jmbg) { 
          this.props.data[i].Ime = this.state.formValue.ime;
          this.props.data[i].Prezime = this.state.formValue.prezime;
          this.props.data[i].Adresa = this.state.formValue.adresa;
          this.props.data[i].Email = this.state.formValue.email;
          this.props.data[i].Telefon = this.state.formValue.telefon; 
          this.props.data[i].Linkedin = this.state.formValue.linkedin;
          this.props.data[i].Skype = this.state.formValue.skype;
          this.props.data[i].Instagram = this.state.formValue.instagram;
          this.props.data[i].Datum_rodjenja = this.state.formValue.datumRodjenja;
          this.props.data[i].JMBG = this.state.formValue.jmbg;
        }
      }
      handleToUpdate(this.props.data);    
  }

    handleSubmit = (event) => {
      event.preventDefault();
      
      // Validate date format if provided
      if (this.state.formValue.datumRodjenja && !/^\d{4}-\d{2}-\d{2}$/.test(this.state.formValue.datumRodjenja)) {
        alert('Please enter date in YYYY-MM-DD format (e.g., 1990-01-31)');
        return;
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to update contacts');
        return;
      }
      
      fetch('/api/auth/put', {
          method: 'PUT',
          body: JSON.stringify(this.state.formValue),
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token  // Add the token to the request headers
          }
        })
        .then(res => {
          if (!res.ok) {
            return res.json().then(err => {
              console.error('Error details:', err);
              throw new Error(err.msg || 'Failed to update contact');
            });
          }
          return res.text();
        })
        .then(res => {
          this.close();
          this.updateData();
        })
        .catch(err => {
          console.error(err);
          alert(err.message || 'Error updating contact');
        });
    }

    render() {
      const disabled = true;
      return (
        <React.Fragment>
          <Modal show={this.state.show} onHide={this.close} size="md">
            <Modal.Header>
              <Modal.Title>Edit User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                fluid
                onChange={this.handleChange}
                formValue={this.state.formValue}
              >
                <FormGroup>
                  <ControlLabel>First Name</ControlLabel>
                  <FormControl name="ime"/>
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
                  <FormControl name="jmbg" disabled={disabled} />
                </FormGroup>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.handleSubmit} appearance="primary">
                Save
              </Button>
              <Button onClick={this.close} appearance="subtle">
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
          <EditIcon className="hvr-grow" onClick={this.open}>Novi korisnik</EditIcon>
          </React.Fragment>
      );
    }
  }
  
export default Edit;