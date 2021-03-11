import React from "react";
import {Grid, makeStyles} from "@material-ui/core";
import AlbumSubTitle from "./AlbumSubTitle";
import ObjectIcon from "./ObjectIcon";

const useStyles = makeStyles(() => ({
    container: {
        padding: "7px"
    },
    fixFlex: {
        minWidth: 0
    },
    dragging: {
        opacity: 0.4
    },
    dateSubTitle: {
        fontSize:"16px",
        padding:"16px 0 16px 6px"
    },
    dateSubTitleDate: {
        color:'#000'
    },
    dateSubTitleLocation: {
        color:"#6b6b6b"
    },
    fileContainer: {
        marginBottom: "5px",
        marginRight: "5px",
        borderRadius: 0,
        height: "auto",
        position: "relative"
    }
}));

export default function PhotosAlbum(props) {
    const classes = useStyles()
    const files = props.fileList
    const fileGroups = {}
    const dateOrder = []
    let index = 0

    files.map(file => {
        const dateObj = new Date(file.exif_date_time !== "" ? file.exif_date_time : file.date)
        const dateDay = dateObj.getFullYear() + "年" + (dateObj.getMonth() + 1) + "月" + dateObj.getDate()+"日"
        if(!Object.prototype.hasOwnProperty.call(fileGroups, dateDay)){
            let location = ""
            if(file.exit_address !== ""){
                try{
                    const exifAddress = JSON.parse(file.exit_address)
                    location = exifAddress.address
                }catch (e){
                    console.log(e)
                }
            }
            fileGroups[dateDay] = {
                date:file.date,
                location: location,
                files:[]
            }
            dateOrder.push(dateDay)
        }
        file.index = index
        file.flexWidth = 0
        file.flexGrow = 0
        file.height = 0
        const picSize = file.pic.split(',')
        if(picSize.length == 2){
            file.flexWidth = parseInt(picSize[0])*200/parseInt(picSize[1])
            file.flexGrow = parseInt(picSize[0])*200/parseInt(picSize[1])
        }
        fileGroups[dateDay].files.push(file)
        if(file.exit_address !== "" && fileGroups[dateDay].location === ""){
            try{
                const exifAddress = JSON.parse(file.exit_address)
                fileGroups[dateDay].location = exifAddress.address
            }catch (e){
                console.log(e)
            }
        }
        index = index + 1
    })

    return (
        <div>
                {dateOrder.map((dateDay) => (
                    <>
                        <AlbumSubTitle date={dateDay} location={fileGroups[dateDay].location}></AlbumSubTitle>
                        <Grid
                            data-clickAway={"true"}
                            container
                            spacing={0}
                            alignItems="flex-start"
                            style={{display: "flex",flexWrap: "wrap"}}
                            className={classes.photosGroupSection}
                        >

                            {
                                fileGroups[dateDay].files.map((value) => (
                                    <div
                                        key={value.id}
                                        className={classes.fileContainer}
                                        style={{ width:value.flexWidth >0 ? value.flexWidth+"px":'auto',flexGrow:value.flexGrow}}
                                    >
                                        <ObjectIcon
                                            key={value.id}
                                            index={value.index}
                                            file={value}
                                        />
                                    </div>
                                ))
                            }
                            <div style={{content: "",flexGrow: "999999999"}}></div>
                        </Grid>
                    </>

                ))}
        </div>
    );
}
