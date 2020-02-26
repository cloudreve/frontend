import React, {useCallback, useEffect, useState} from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {useDispatch} from "react-redux";
import {toggleSnackbar} from "../../../actions";

export default function DomainInput({onChange,value,required,label}){
    const [domain,setDomain] = useState("");
    const [protocol,setProtocol] = useState("https://");

    useState(()=>{
        if (value.startsWith("https://")){
            setDomain(value.replace("https://",""));
            setProtocol("https://")
        }else{
            setDomain(value.replace("http://",""));
            setProtocol("http://")
        }
    },[value]);

    return (
        <FormControl>
            <InputLabel htmlFor="component-helper">
                {label}
            </InputLabel>
            <Input
                value={domain}
                onChange={e=>{
                    setDomain(e.target.value);
                    onChange({
                        target:{
                            value:protocol + e.target.value,
                        }
                    })

                }}
                required = {required}
                startAdornment={
                    <InputAdornment position="start">
                        <Select
                            value={protocol}
                            onChange={(e)=>{
                                setProtocol(e.target.value);
                                onChange({
                                    target:{
                                        value:e.target.value + domain,
                                    }
                                })

                            }}
                        >
                            <MenuItem value={"http://"}>http://</MenuItem>
                            <MenuItem value={"https://"}>https://</MenuItem>
                        </Select>
                    </InputAdornment>
                }
            />
        </FormControl>
    )
}