import React, { useEffect } from "react";
import useMountedRef from "./hooks/useMountedRef";
import type { BrokenElementParams } from "./types";
import "./Photo.less";
import { FileResponse } from "../../../../api/explorer.ts";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import { getFileEntityUrl } from "../../../../api/api.ts";
import FacebookCircularProgress from "../../../Common/CircularProgress.tsx";
import { grey } from "@mui/material/colors";
import { getFileLinkedUri } from "../../../../util";

export interface IPhotoLoadedParams {
  loaded?: boolean;
  naturalWidth?: number;
  naturalHeight?: number;
  broken?: boolean;
}

export interface IPhotoProps extends React.HTMLAttributes<HTMLElement> {
  file: FileResponse;
  version?: string;
  loaded: boolean;
  broken: boolean;
  onPhotoLoad: (params: IPhotoLoadedParams) => void;
  loadingElement?: JSX.Element;
  brokenElement?: JSX.Element | ((photoProps: BrokenElementParams) => JSX.Element);
}

export default function Photo({
  file,
  version,
  loaded,
  broken,
  className,
  onPhotoLoad,
  loadingElement,
  brokenElement,
  ...restProps
}: IPhotoProps) {
  const mountedRef = useMountedRef();
  const dispatch = useAppDispatch();
  const [imageSrc, setImageSrc] = React.useState<string | undefined>(undefined);

  useEffect(() => {
    dispatch(
      getFileEntityUrl({
        uris: [getFileLinkedUri(file)],
        entity: version,
      }),
    )
      .then((res) => {
        setImageSrc(res.urls[0].url);
      })
      .catch((e) => {
        if (mountedRef.current) {
          onPhotoLoad({
            broken: true,
          });
        }
      });
  }, []);

  function handleImageLoaded(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = e.target as HTMLImageElement;
    if (mountedRef.current) {
      onPhotoLoad({
        loaded: true,
        naturalWidth,
        naturalHeight,
      });
    }
  }

  function handleImageBroken() {
    if (mountedRef.current) {
      onPhotoLoad({
        broken: true,
      });
    }
  }

  if (file && !broken) {
    return (
      <>
        {imageSrc && (
          <img
            className={`PhotoView__Photo${className ? ` ${className}` : ""}`}
            src={imageSrc}
            draggable={false}
            onLoad={handleImageLoaded}
            onError={handleImageBroken}
            alt=""
            {...restProps}
          />
        )}
        {!loaded && (
          <FacebookCircularProgress sx={{ position: "absolute", top: 0 }} fgColor={"#fff"} bgColor={grey[800]} />
        )}
      </>
    );
  }

  if (brokenElement) {
    return (
      <span className="PhotoView__icon">
        {typeof brokenElement === "function" ? brokenElement({ src: imageSrc ?? "" }) : brokenElement}
      </span>
    );
  }

  return null;
}
