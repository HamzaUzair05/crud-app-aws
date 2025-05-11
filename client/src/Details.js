import React from 'react';
import { Drawer, Button, Divider } from 'rsuite';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

class Details extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        show: false
      };
      this.close = this.close.bind(this);
      this.toggleDrawer = this.toggleDrawer.bind(this);
    }
    close() {
      this.setState({
        show: false
      });
    }
    toggleDrawer() {
      this.setState({ show: true });
    }
    render() {
      return (
        <React.Fragment>
            <MoreHorizIcon className="hvr-grow" onClick={this.toggleDrawer}>Open</MoreHorizIcon>
          <Drawer
            show={this.state.show}
            onHide={this.close}
          >
            <Drawer.Header>
              <Drawer.Title>Details</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <p><b>First Name:</b> {this.props.details.Ime}</p>
              <Divider className="divider-margin"/>
              <p><b>Last Name:</b> {this.props.details.Prezime}</p>
              <Divider className="divider-margin"/>
              <p><b>Email:</b> {this.props.details.Email}</p>
              <Divider className="divider-margin"/>
              <p><b>Phone:</b> {this.props.details.Telefon}</p>
              <Divider className="divider-margin"/>
              <p><b>Address:</b> {this.props.details.Adresa}</p>
              <Divider className="divider-margin"/>
              <p><b>LinkedIn:</b> {this.props.details.Linkedin}</p>
              <Divider className="divider-margin"/>
              <p><b>Skype:</b> {this.props.details.Skype}</p>
              <Divider className="divider-margin"/>
              <p><b>Instagram:</b> {this.props.details.Instagram}</p>
              <Divider className="divider-margin"/>
              <p><b>Date of Birth:</b> {this.props.details.Datum_rodjenja}</p>
              <Divider className="divider-margin"/>
              <p><b>ID Number:</b> {this.props.details.JMBG}</p>
            </Drawer.Body>
            <Drawer.Footer>
              <Button onClick={this.close} appearance="primary">Back</Button>
            </Drawer.Footer>
          </Drawer>
        </React.Fragment>
      );
    }
  
  }
  
  export default Details;