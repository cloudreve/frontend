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
  
  const capInstanceURL = useAppSelector(
    (state) => state.siteConfig.basic.config.cap_instance_url,
  );
  const capKeyID = useAppSelector(
    (state) => state.siteConfig.basic.config.cap_key_id,
  );

  const refreshCaptcha = async () => {
    if (widgetRef.current) {
      widgetRef.current.reset?.();
    }
  };

  useEffect(() => {
    refreshCaptcha();
  }, [generation]);

  useEffect(() => {
    if (!capInstanceURL || !capKeyID || !captchaRef.current) {
      return;
    }

    // Load Cap widget script
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
      if (typeof window !== "undefined" && (window as any).Cap) {
        // Create cap-widget element
        const widget = document.createElement("cap-widget");
        widget.setAttribute("data-cap-api-endpoint", `${capInstanceURL.replace(/\/$/, "")}/${capKeyID}/api/`);
        widget.id = "cap-widget";
        
        // Clear previous widget
        if (captchaRef.current) {
          captchaRef.current.innerHTML = "";
          captchaRef.current.appendChild(widget);
        }

        // Listen for solve event
        widget.addEventListener("solve", (e: any) => {
          const token = e.detail.token;
          if (token) {
            onStateChange({ ticket: token });
          }
        });

        widgetRef.current = widget;
      }
    };

    if (script.readyState === "complete" || script.readyState === "loaded") {
      initWidget();
    } else {
      script.onload = initWidget;
    }

    return () => {
      // Cleanup
      if (captchaRef.current) {
        captchaRef.current.innerHTML = "";
      }
    };
  }, [capInstanceURL, capKeyID, onStateChange]);

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