import { Modal, Button, Icon } from 'rsuite';
import React from 'react';
import DeleteIcon from '@material-ui/icons/Delete';


class Remove extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        show: false
      };
      this.close = this.close.bind(this);
      this.open = this.open.bind(this);
      this.updateData = this.updateData.bind(this);
    }
    close() {
      this.setState({ show: false });
    }
    open() {
      this.setState({ show: true });
    }

    updateData() { 
      var handleToUpdate = this.props.handleToUpdate;
      for( var i =0; i < this.props.data.length; i++) { 
        if( this.props.data[i].JMBG === this.props.details.JMBG) { 
          this.props.data.splice(i,1);
          break;
        }
      }  
      handleToUpdate(this.props.data);   
  }
    
    handleSubmit = (event) => {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to delete contacts');
        return;
      }
      
      fetch('/api/auth/delete', {
          method: 'DELETE',
          body: JSON.stringify(this.props.details),
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token  // Add the token to the request headers
          }
        })
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to delete contact');
          }
          return res.text();
        })
        .then(res => this.close())
        .then(res => this.updateData())
        .catch(err => {
          console.error(err);
          alert('Error deleting contact');
        });
        
        event.preventDefault();  
    }

    render() {
      return (
        <React.Fragment>
          <DeleteIcon className="hvr-grow" onClick={this.open}>Open</DeleteIcon>
          <Modal backdrop="static" show={this.state.show} onHide={this.close} size="xs">
            <Modal.Body>
              <Icon
                icon="remind"
                style={{
                  color: '#ffb300',
                  fontSize: 24
                }}
              />
              {'  '}
              Are you sure?
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.handleSubmit} appearance="primary">
                Yes
              </Button>
              <Button onClick={this.close} appearance="subtle">
                No
              </Button>
            </Modal.Footer>
          </Modal>
          </React.Fragment>
      );
    }
  }

  export default Remove;