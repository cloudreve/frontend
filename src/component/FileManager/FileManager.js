import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles';

import Navigator from "./Navigator"
import Explorer from "./Explorer"
import Modals from "./Modals"

const styles = theme => ({

})

class FileManager extends Component {
    
    render() {
        return (
             <div>
                <Modals/> 
                <Navigator/>
                <Explorer/>
             </div>
        );
    }

}

FileManager.propTypes = {
};

export default withStyles(styles)(FileManager);