import React, { Component } from 'react'
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import DPlayer from "react-dplayer";


const styles = theme => ({
    layout: {
        width: 'auto',
        marginTop:'30px',
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
          width: 1100,
          marginLeft: 'auto',
          marginRight: 'auto',
        },
      },
      player:{
        borderRadius: "4px", 
      }
})

class VideoViewer extends Component {

    render() {
        const { classes } = this.props;
        return (
             <div className={classes.layout}>
                <Paper className={classes.root} elevation={1}>
                   
                <DPlayer className={classes.player} video={{url: window.videoInfo.url}}/>
                </Paper>
             </div>
        );
    }

}

VideoViewer.propTypes = {
};

export default withStyles(styles)(VideoViewer);