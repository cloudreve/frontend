import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import DialogContentText from '@material-ui/core/DialogContentText';
import { blue } from '@material-ui/core/colors';

const emails = ['username@gmail.com', 'user02@gmail.com'];
const useStyles = makeStyles({
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  },
  loadingContainer:{
    display:"flex",
  },
  loading:{
    marginTop: 10,
    marginLeft: 20,
  }
});

export default function LoadingDialog(props) {
  const classes = useStyles();
  const {  open } = props;



  return (
    <Dialog aria-labelledby="simple-dialog-title" open={open}>
       <DialogContent>
     
     <DialogContentText className={classes.loadingContainer}><CircularProgress color="secondary" />
      <div className={classes.loading}>处理中...</div>
     </DialogContentText>
     </DialogContent>
    </Dialog>
  );
}

LoadingDialog.propTypes = {
  open: PropTypes.bool.isRequired,
};
