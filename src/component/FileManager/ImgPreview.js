import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'

import { 
    showImgPreivew,
}from "../../actions/index"
import {imgPreviewSuffix} from "../../config"
import PhotoSwipe from'react-photoswipe';
import { withStyles } from '@material-ui/core';
import('react-photoswipe/lib/photoswipe.css')

const styles = theme => ({
})

const mapStateToProps = state => {
    return {
        first:state.explorer.imgPreview.first,
        other:state.explorer.imgPreview.other,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        showImgPreivew:(first)=>{
            dispatch(showImgPreivew(first))
        }
    }
}

class ImgPreviewCompoment extends Component {

    state = {
        first:[],
        items:[],
        open:false,
        loaded:false,
    }

    options={
        history: false,
				focus: false,
				showAnimationDuration: 5,
				hideAnimationDuration: 0,
				bgOpacity: 0.8,
				closeOnScroll: 0,
    };

    componentWillReceiveProps = (nextProps)=>{
        let items = [];
        if(nextProps.first!==null){
            if(!this.state.loaded){
                this.setState({
                    loaded:true,
                })
            }
            var firstOne;
            // eslint-disable-next-line
            nextProps.other.map((value)=>{
                let fileType =value.name.split(".").pop().toLowerCase();
                
                if(imgPreviewSuffix.indexOf(fileType)!==-1){
                    let newImg = {
                        h:0,
                        w:0,
                        title:value.name,
                        src:window.apiURL.preview+"?action=preview&path="+encodeURIComponent(value.path==="/"?value.path+value.name:value.path+"/"+value.name),
                    };
                    if((value.path===nextProps.first.path)&&(value.name===nextProps.first.name)){
                        firstOne = newImg;
                    }else{
                        items.push(newImg);
                    }
                    
                };
            });
            items.unshift(firstOne);
            this.setState({
                items:items,
                open:true,
            });
           
        }
    }

    handleClose=()=>{
        this.props.showImgPreivew(null);
        this.setState({
            loaded:true,
            open:false,
        });
    }

    setSize = (ps,index,item)=>{
        if (item.h < 1 || item.w < 1) {
            let img = new Image()
            img.onload = () => {
                item.w = img.width
                item.h = img.height
                ps.invalidateCurrItems()
                ps.updateSize(true)
            }
            img.src = item.src
        }
    }

    render() {
        if(this.state.loaded){
            return (
               <div>
                  <PhotoSwipe isOpen={this.state.open} items={this.state.items} options={this.options} onClose={this.handleClose} imageLoadComplete={this.setSize}/>
               </div>
            );
        }else{
            return (<div></div>);
        }
        
    }
}

ImgPreviewCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
};


const ImgPreivew = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(ImgPreviewCompoment))

export default ImgPreivew