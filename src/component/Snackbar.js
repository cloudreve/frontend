import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import {
 } from "../actions/index"
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Snackbar from '@material-ui/core/Snackbar'
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import green from '@material-ui/core/colors/green';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import amber from '@material-ui/core/colors/amber';
import IconButton from '@material-ui/core/IconButton';
import WarningIcon from '@material-ui/icons/Warning';

const mapStateToProps = state => {
    return {
        snackbar:state.viewUpdate.snackbar,
    }
}

const mapDispatchToProps = dispatch => {
    return {
    }
}

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
  };

const styles1 = theme => ({
    success: {
        backgroundColor: green[600],
      },
      error: {
        backgroundColor: theme.palette.error.dark,
      },
      info: {
        backgroundColor: theme.palette.primary.dark,
      },
      warning: {
        backgroundColor: amber[700],
      },
      icon: {
        fontSize: 20,
      },
      iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing.unit,
      },
      message: {
        display: 'flex',
        alignItems: 'center',
      },
})

function MySnackbarContent(props) {
    const { classes, className, message, onClose, variant, ...other } = props;
    const Icon = variantIcon[variant];
  
    return (
      <SnackbarContent
        className={classNames(classes[variant], className)}
        aria-describedby="client-snackbar"
        message={
          <span id="client-snackbar" className={classes.message}>
            <Icon className={classNames(classes.icon, classes.iconVariant)} />
            {message}
          </span>
        }
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={onClose}
          >
            <CloseIcon className={classes.icon} />
          </IconButton>,
        ]}
        {...other}
      />
    );
  }
  MySnackbarContent.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    message: PropTypes.node,
    onClose: PropTypes.func,
    variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']).isRequired,
  };
  
const MySnackbarContentWrapper = withStyles(styles1)(MySnackbarContent);  
const styles = theme => ({
    margin: {
        margin: theme.spacing.unit,
    },
})
class SnackbarCompoment extends Component {

    state={
        open:false,
    }

    componentWillReceiveProps = (nextProps)=>{
        if(nextProps.snackbar.toggle !== this.props.snackbar.toggle){
            this.setState({open:true});
        }
    }

    handleClose= ()=>{
        this.setState({open:false});
    } 
    
    render() {

        return (
            <Snackbar
            anchorOrigin={{
                vertical: this.props.snackbar.vertical,
                horizontal: this.props.snackbar.horizontal,
            }}
            open={this.state.open}
            autoHideDuration={6000}
            onClose={this.handleClose}
            >
            <MySnackbarContentWrapper
                onClose={this.handleClose}
                variant={this.props.snackbar.color}
                message={this.props.snackbar.msg} 
            />
        </Snackbar>
        );
    }

}

const AlertBar = connect(
    mapStateToProps,
    mapDispatchToProps
)( withStyles(styles)(SnackbarCompoment))
  
export default AlertBar