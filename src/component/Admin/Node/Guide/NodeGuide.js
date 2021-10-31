import React, { useCallback, useState } from "react";
import Stepper from "@material-ui/core/Stepper";
import StepLabel from "@material-ui/core/StepLabel";
import Step from "@material-ui/core/Step";
import Typography from "@material-ui/core/Typography";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../../actions";
import { useHistory } from "react-router";
import { randomStr } from "../../../../utils";
import Button from "@material-ui/core/Button";
import { lighten, makeStyles } from "@material-ui/core/styles";
import Communication from "./Communication";

const steps = [
    {
        title: "通信配置",
        optional: false,
        component: function show(p) {
            return <Communication {...p} />;
        },
    },
    {
        title: "离线下载",
        optional: false,
        component: function show(p) {
            return <Communication {...p} />;
        },
    },
    {
        title: "杂项信息",
        optional: false,
    },
    {
        title: "完成",
        optional: false,
    },
];

export default function NodeGuide(props) {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [skipped, setSkipped] = React.useState(new Set());
    const [node, setNode] = useState(
        props.node
            ? props.node
            : {
                  Status: 1,
                  Type: 0,
                  Aria2Enabled: false,
                  Server: "https://example.com:5212",
                  SlaveKey: randomStr(64),
                  MasterKey: randomStr(64),
                  Aria2Options: {},
              }
    );

    const isStepSkipped = (step) => {
        return skipped.has(step);
    };

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    return (
        <div>
            <Typography variant={"h6"}>
                {props.node ? "修改" : "添加"} 节点
            </Typography>
            <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                    const stepProps = {};
                    const labelProps = {};
                    if (label.optional) {
                        labelProps.optional = (
                            <Typography variant="caption">可选</Typography>
                        );
                    }
                    if (isStepSkipped(index)) {
                        stepProps.completed = false;
                    }
                    return (
                        <Step key={label.title} {...stepProps}>
                            <StepLabel {...labelProps}>{label.title}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>

            {steps[activeStep].component({
                onSubmit: (e) => setActiveStep(1),
                loading: loading,
                node: node,
            })}
        </div>
    );
}
