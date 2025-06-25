import { grey } from "@mui/material/colors";
import { heicTo, isHeic } from "heic-to";
import * as LivePhotosKit from "livephotoskit";
import React, { useEffect } from "react";
import { getFileEntityUrl, getFileInfo } from "../../../../api/api.ts";
import { EntityType, FileResponse, Metadata } from "../../../../api/explorer.ts";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import { getFileLinkedUri } from "../../../../util";
import FacebookCircularProgress from "../../../Common/CircularProgress.tsx";
import useMountedRef from "./hooks/useMountedRef";
import "./Photo.less";
import type { BrokenElementParams } from "./types";

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
  const playerRef = React.useRef<LivePhotosKit.Player | null>(null);

  // Helper function to check if file is HEIC/HEIF based on extension
  const isHeicFile = (fileName: string): boolean => {
    const extension = fileName.toLowerCase().split(".").pop();
    return extension === "heic" || extension === "heif";
  };

  // Helper function to convert HEIC to PNG
  const convertHeicToPng = async (imageUrl: string): Promise<string> => {
    try {
      // Fetch the image as blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Convert blob to File object for isHeic check
      const file = new File([blob], "image", { type: blob.type });

      // Check if it's actually a HEIC file
      const isHeicBlob = await isHeic(file);

      if (isHeicBlob) {
        // Convert HEIC to PNG
        const pngBlob = await heicTo({
          blob: blob,
          type: "image/png",
          quality: 0.9,
        });

        // Create object URL for the converted image
        return URL.createObjectURL(pngBlob);
      } else {
        // If not HEIC, return original URL
        return imageUrl;
      }
    } catch (error) {
      console.error("Error converting HEIC to PNG:", error);
      throw error;
    }
  };

  useEffect(() => {
    dispatch(
      getFileEntityUrl({
        uris: [getFileLinkedUri(file)],
        entity: version,
      }),
    )
      .then(async (res) => {
        const originalUrl = res.urls[0].url;

        // Check if the file is HEIC/HEIF and convert if needed
        if (isHeicFile(file.name)) {
          try {
            const convertedUrl = await convertHeicToPng(originalUrl);
            setImageSrc(convertedUrl);
            if (file.metadata?.[Metadata.live_photo]) {
              loadLivePhoto(file, convertedUrl);
            }
          } catch (error) {
            console.error("Failed to convert HEIC image:", error);
            if (mountedRef.current) {
              onPhotoLoad({
                broken: true,
              });
            }
          }
        } else {
          setImageSrc(originalUrl);
          loadLivePhoto(file, originalUrl);
        }
      })
      .catch((e) => {
        if (mountedRef.current) {
          onPhotoLoad({
            broken: true,
          });
        }
      });
  }, []);

  const loadLivePhoto = async (file: FileResponse, imgUrl: string) => {
    if (!file.metadata?.[Metadata.live_photo]) {
      return;
    }

    try {
      const fileExtended = await dispatch(
        getFileInfo(
          {
            uri: getFileLinkedUri(file),
            extended: true,
          },
          true,
        ),
      );

      // find live photo entity
      const livePhotoEntity = fileExtended?.extended_info?.entities?.find(
        (entity) => entity.type === EntityType.live_photo,
      );

      // get live photo entity url
      const livePhotoEntityUrl = await dispatch(
        getFileEntityUrl({
          uris: [getFileLinkedUri(file)],
          entity: livePhotoEntity?.id,
        }),
      );

      const imgElement = document.getElementById(file.id);
      if (imgElement) {
        const player = LivePhotosKit.Player(imgElement as HTMLElement);
        playerRef.current = player;
        player.photoSrc = imgUrl;
        player.videoSrc = livePhotoEntityUrl.urls[0].url;
        player.proactivelyLoadsVideo = true;
      }
    } catch (e) {
      console.error("Failed to load live photo:", e);
    }
  };

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

  function handleImageBroken(e: React.SyntheticEvent<HTMLImageElement>) {
    console.log("handleImageBroken", e);
    if (mountedRef.current) {
      onPhotoLoad({
        broken: true,
      });
    }
  }

  // Clean up object URL when component unmounts or imageSrc changes
  useEffect(() => {
    return () => {
      if (imageSrc && imageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  const {
    onMouseDown,
    onTouchStart,
    style: { width, height, ...restStyle },
    ...rest
  } = restProps;

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.updateSize(width, height);
    }
  }, [width, height]);

  if (file && !broken) {
    return (
      <>
        {imageSrc && (
          <div onMouseDown={onMouseDown} onTouchStart={onTouchStart} style={{ width, height }}>
            <img
              id={file?.id ?? "photobox-img"}
              className={`PhotoView__Photo${className ? ` ${className}` : ""}`}
              src={imageSrc}
              draggable={false}
              onLoad={handleImageLoaded}
              onError={handleImageBroken}
              alt=""
              style={{ width, height, ...restStyle }}
              {...rest}
            />
          </div>
        )}
        {!loaded && (
          <FacebookCircularProgress
            sx={{ position: "relative", top: "-20px", left: "-20px" }}
            fgColor={"#fff"}
            bgColor={grey[800]}
          />
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
