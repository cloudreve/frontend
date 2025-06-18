import { useEffect, useRef } from "react";
import { useAppSelector } from "../../../redux/hooks.ts";
import { CaptchaParams } from "./Captcha.tsx";
import { Box } from "@mui/material";

export interface CapProps {
  onStateChange: (state: CaptchaParams) => void;
  generation: number;
}

const CapCaptcha = ({ onStateChange, generation, ...rest }: CapProps) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const onStateChangeRef = useRef(onStateChange);
  const isInitializedRef = useRef(false);
  
  const capInstanceURL = useAppSelector(
    (state) => state.siteConfig.basic.config.captcha_cap_instance_url,
  );
  const capKeyID = useAppSelector(
    (state) => state.siteConfig.basic.config.captcha_cap_key_id,
  );

  // Keep callback reference up to date
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  const refreshCaptcha = async () => {
    if (widgetRef.current && captchaRef.current) {
      widgetRef.current.remove?.();
      captchaRef.current.innerHTML = "";
      
      if (typeof window !== "undefined" && (window as any).Cap && capInstanceURL && capKeyID) {
        const widget = document.createElement("cap-widget");
        widget.setAttribute("data-cap-api-endpoint", `${capInstanceURL.replace(/\/$/, "")}/${capKeyID}/api/`);
        widget.id = "cap-widget";
        
        captchaRef.current.appendChild(widget);
        
        widget.addEventListener("solve", (e: any) => {
          const token = e.detail.token;
          if (token) {
            onStateChangeRef.current({ ticket: token });
          }
        });
        
        widgetRef.current = widget;
      }
    }
  };

  useEffect(() => {
    if (generation > 0) {
      refreshCaptcha();
    }
  }, [generation]);

  useEffect(() => {
    if (!capInstanceURL || !capKeyID || !captchaRef.current) {
      return;
    }

    if (isInitializedRef.current) {
      return;
    }

    const scriptId = "cap-widget-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `${capInstanceURL.replace(/\/$/, "")}/assets/widget.js`;
      script.async = true;
      document.head.appendChild(script);
    }

    const initWidget = () => {
      if (typeof window !== "undefined" && (window as any).Cap && captchaRef.current) {
        const widget = document.createElement("cap-widget");
        widget.setAttribute("data-cap-api-endpoint", `${capInstanceURL.replace(/\/$/, "")}/${capKeyID}/api/`);
        widget.id = "cap-widget";
        
        captchaRef.current.innerHTML = "";
        captchaRef.current.appendChild(widget);

        widget.addEventListener("solve", (e: any) => {
          const token = e.detail.token;
          if (token) {
            onStateChangeRef.current({ ticket: token });
          }
        });

        widgetRef.current = widget;
        isInitializedRef.current = true;
      }
    };

    if ((script as any).readyState === "complete" || (script as any).readyState === "loaded") {
      initWidget();
    } else {
      script.onload = initWidget;
    }

    return () => {
      isInitializedRef.current = false;
      if (captchaRef.current) {
        captchaRef.current.innerHTML = "";
      }
    };
  }, [capInstanceURL, capKeyID]);

  if (!capInstanceURL || !capKeyID) {
    return null;
  }

  return (
    <Box sx={{ textAlign: "center" }}>
      <div ref={captchaRef} {...rest} />
    </Box>
  );
};

export default CapCaptcha; 