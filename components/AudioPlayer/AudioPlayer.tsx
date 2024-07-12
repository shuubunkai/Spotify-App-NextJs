/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CollectionsStatus,
  getLikedSongs,
  IStateProps,
  LikedStatus,
  nextSong,
  onRepeat,
  onShuffle,
  playPause,
  setTrackProgress,
} from "../../stores/player/currentAudioPlayer";
import { useEffect } from "react";
import Controls from "./Controls";
import SeekBar from "./SeekBar";
import Buttons from "./Buttons";
import { useRouter } from "next/router";
import FullScreenPlayer from "./FullScreenPlayer";
import CustomImage from "../CustomImage";
import { getCollections } from "../../stores/player/currentAudioPlayer";

function AudioPlayer({ className }: { className: string }) {
  const router = useRouter();
  const { user, status } = useSelector((state: any) => state.auth);
  const {
    isPlaying,
    activeSong,
    currentIndex,
    trackProgress,
    fetchlikedStatus,
    collectionStatus,

    tracks,
    isShuffle,
    isRepeat,
  }: IStateProps = useSelector((state: any) => state.player);
  const dispatch = useDispatch<any>();
  const audioRef = useRef(
    typeof Audio !== "undefined" ? new Audio(activeSong!.src) : null
  );
  const isReady = useRef(false);
  const [volume, setVolume] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>();
  const [seekBarColor, setSeekBarColor] = useState("#fff");
  const changeSeekBarColor = (color: string) => setSeekBarColor(color);

  useEffect(() => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current!.play();
      startTimer();
    } else {
      audioRef.current!.pause();
    }
  }, [isPlaying]);

  const toNextTrack = () => {
    if (isShuffle) {
      dispatch(nextSong(Math.floor(Math.random() * tracks.length)));
    } else if (tracks.length - 1 !== currentIndex) {
      dispatch(nextSong(currentIndex + 1));
    }
  };
  const toPrevTrack = () => {
    if (isShuffle) {
      dispatch(nextSong(Math.floor(Math.random() * tracks.length)));
    } else if (currentIndex !== 0) {
      dispatch(nextSong(currentIndex - 1));
    }
  };

  useEffect(() => {
    audioRef.current!.loop = isRepeat;
  }, [isRepeat]);

  useEffect(() => {
    audioRef.current!.pause();

    audioRef.current = new Audio(activeSong!.src);
    dispatch(setTrackProgress(audioRef.current.currentTime));
    audioRef.current.volume = volume;

    if (isReady.current) {
      audioRef.current.play();
      dispatch(playPause(true));
      startTimer();
    } else {
      isReady.current = true;
    }
  }, [activeSong, currentIndex]);

  const onScrub = (value: any) => {
    // Clear any timers already running
    clearInterval(intervalRef.current);
    audioRef.current!.currentTime = value;
    dispatch(setTrackProgress(audioRef.current!.currentTime));
  };

  const startTimer = () => {
    // Clear any timers already running
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (audioRef.current!.ended) {
        toNextTrack();
      } else {
        dispatch(setTrackProgress(audioRef.current!.currentTime));
      }
    }, 1000);
  };

  const onScrubEnd = () => {
    // If not already playing, start
    if (!isPlaying) {
      dispatch(playPause(true));
    }
    startTimer();
  };

  useEffect(() => {
    if (fetchlikedStatus == LikedStatus.Initial) {
      if (user) {
        dispatch(getLikedSongs(user.token));
      }
    } // Pause and clean up on unmount
    if (collectionStatus == CollectionsStatus.Initial) {
      if (user) {
        dispatch(getCollections(user.token));
      }
    }
    return () => {
      audioRef.current!.pause();
      clearInterval(intervalRef.current);
    };
  }, []);

  // get formated time in 0:00

  // update volume function
  const updateVolume = (e: any) => {
    setVolume(e);
    audioRef.current!.volume = e;
  };

  const currentPercentage = activeSong!.duration
    ? `${(trackProgress / activeSong!.duration) * 100}%`
    : "0%";

  const trackStyling = `
    -webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(${currentPercentage}, ${seekBarColor}), color-stop(${currentPercentage}, #777))
  `;

  if (router.pathname === "/playing") {
    return (
      <FullScreenPlayer
        changeSeekBarColor={changeSeekBarColor}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        isPlaying={isPlaying}
        toNextTrack={toNextTrack}
        toPrevTrack={toPrevTrack}
        trackProgress={trackProgress}
        trackBarStyling={trackStyling}
        audioRef={audioRef}
        activeSong={activeSong!}
        onScrubEnd={onScrubEnd}
        onScrub={onScrub}
        updateVolume={updateVolume}
        volume={volume}
        trackStyling={trackStyling}
      />
    );
  }

  return (
    <div
      onClick={() => router.push("/playing")}
      className={`font-ProximaRegular 
      fixed bottom-0 left-0 right-0 py-3 px-4 pb-4
     border-t-[#242424] border-t
     mobile:py-1 mobile:px-2 z-20
     mobile:bottom-12 tablet:bottom-12
      bg-[#121212] 
      select-none ${className}`}
    >
      <div
        className="flex flex-row 
      items-center justify-between 
      w-screen max-w-full mini-laptop:px-2 mobile:p-2 mobile:pb-0 "
      >
        <div className="flex flex-row items-center w-full cursor-pointer">
          <div
            style={{
              backgroundColor: activeSong!.cover_image.color,
              boxShadow:
                "rgba(0, 0, 0, 0.2) 0px 12px 28px 0px, rgba(0, 0, 0, 0.1) 0px 2px 4px 0px, rgba(255, 255, 255, 0.05) 0px 0px 0px 1px inset",
            }}
            className="w-[50px] h-[50px] min-w-[50px]
         relative mini-laptop:w-[40px] mini-laptop:h-[40px]
          mini-laptop:min-w-[40px] mobile:min-w-[35px] mobile:w-[35px]
           mobile:h-[35px] cursor-pointer rounded-sm"
          >
            <CustomImage
              src={
                activeSong!.cover_image.url +
                "&auto=format&fit=crop&w=400&q=50&h=400"
              }
              className="rounded-sm w-[50px] h-[50px]"
            />
          </div>

          <div className="mx-4 mobile:mx-3">
            <p
              className="text-gray-300 
          cursor-pointer line-clamp-1 mobile:text-sm"
            >
              {activeSong!.track_name}
            </p>

            <p
              className="text-gray-400 text-sm mobile:text-xs 
            hover:underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (activeSong?.artist_id == 120) {
                  window.open(`https://anshrathod.com`, "_blank");
                } else {
                  router.push(`/artist/${activeSong?.artist_id}`);
                }
              }}
            >
              {activeSong!.artist_name}
            </p>
          </div>
        </div>
        <div>
          <Controls
            isFullScreen={false}
            isShuffle={isShuffle}
            isRepeat={isRepeat}
            onRepeat={() => dispatch(onRepeat(!isRepeat))}
            onShuffle={() => dispatch(onShuffle(!isShuffle))}
            playPause={() => dispatch(playPause(!isPlaying))}
            isPlaying={isPlaying}
            nextSong={toNextTrack}
            prevSong={toPrevTrack}
          />
          <SeekBar
            changeSeekBarColor={changeSeekBarColor}
            trackProgress={trackProgress}
            trackBarStyling={trackStyling}
            audioRef={audioRef}
            isFullScreen={false}
            activeSong={activeSong!}
            onScrubEnd={onScrubEnd}
            onScrub={onScrub}
          />
        </div>
        <Buttons
          download_url={activeSong!.src}
          track_id={activeSong!.id}
          updateVolume={updateVolume}
          showVolumeSeekBar
          volume={volume}
          className="tablet:hidden mobile:hidden"
        />
      </div>
    </div>
  );
}

export default AudioPlayer;
