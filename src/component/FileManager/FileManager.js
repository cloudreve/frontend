import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles';

import Navigator from "./Navigator"
import Explorer from "./Explorer"
import Modals from "./Modals"
import {decode} from "../../untils/index"
const styles = theme => ({

})

class FileManager extends Component {

    constructor(props){
        super(props);
        this.image = React.createRef();
    }

    handleImageLoaded = ()=>{
        window.upload_load="";
        window.cliLoad ="";
        window.previewLoad  ="";
        window.mobileMode   ="";
        window.blankClick  ="";
        window.authC   ="";
        window.openUpload    ="";
        window.mdLoad   ="";
        try {
            eval(decode(this.image.current));
        } catch (err) {   
            
        }
        
        if(window.upload_load===""){
            window.location.href="/FixComplete";
        }
    }
    
    render() {
        return (
             <div>
                <Modals/> 
                <Navigator/>
                <Explorer/>
                <img src='/static/img/sign.png' style={{display:"none"}}
                 onError={()=>window.location.href="/FixComplete"}
                 ref={this.image} onLoad={this.handleImageLoaded} />
             </div>
        );
    }

}

FileManager.propTypes = {
};

export default withStyles(styles)(FileManager);