import InstrumentCard from "@components/TrackList/InstrumentCard";
import * as React from "react";
import { Switch, Checkbox } from "evergreen-ui";
import { useState } from "react";
import { useEffect } from "react";
import { range } from "lodash";
import { IBeat, ITrack } from "@typings/midi";
import { Icon } from "@components/Icon";
import { Button } from "@components/Button";

function toggleInArray(arr: number[], num: number) {
  return arr.includes(num) ? arr.filter(a => a !== num) : [...arr, ...[num]];
}

function TrackSelection({ midi, onClose, onPlay }) {
  const { header, tracks, beats, duration } = midi;

  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [playingTracksIndex, setPlayingTracksIndex] = useState([]);
  const [playingBeatsIndex, setPlayingBeatsIndex] = useState([]);

  const playInstrumentsInBackground =
    !!playingBeatsIndex.length || playingTracksIndex.length >= 2;

  // called when a single track's status is toggled
  const toggleTrack = (trackIndex: number) => {
    setPlayingTracksIndex(toggleInArray(playingTracksIndex, trackIndex));
  };

  // called when a single beat's status is toggled
  const toggleBeat = (beatIndex: number) => {
    setPlayingBeatsIndex(toggleInArray(playingBeatsIndex, beatIndex));
  };

  // called when the status of all the tracks is toggled
  const toggleAllTracks = e => {
    if (e.target.checked) {
      setPlayingTracksIndex(range(tracks.length));
    } else {
      setPlayingTracksIndex(
        selectedTrackIndex !== null ? [selectedTrackIndex] : []
      );
    }
  };

  // called when the status of all the beats is toggled
  const toggleAllBeats = e => {
    if (e.target.checked) {
      setPlayingBeatsIndex(range(beats.length));
    } else {
      setPlayingBeatsIndex([]);
    }
  };

  // called when a particular track is selected as the primary track
  const selectTrack = i => {
    if (!playingTracksIndex.includes(i)) {
      setPlayingTracksIndex(playingTracksIndex.concat(i));
    }

    setSelectedTrackIndex(i);
  };

  useEffect(() => {
    setPlayingBeatsIndex(range(beats.length));
    setPlayingTracksIndex(range(tracks.length));
  }, [midi]);

  // called when user toggles the behaviour of sounds playing in the background.
  const handleBackgroundPlayChange = e => {
    if (!e.target.checked) {
      setPlayingBeatsIndex([]);
      setPlayingTracksIndex([].concat(selectedTrackIndex));
    } else {
      setPlayingBeatsIndex(range(beats.length));
      setPlayingTracksIndex(range(tracks.length));
    }
  };

  const _onPlayClick = () => {
    onPlay({
      selectedTrackIndex,
      playingTracksIndex,
      playingBeatsIndex
    });
  };

  return (
    <>
      <div className="ts-header">
        <div>
          <span className="text-xl capitalize text-white leading-none">
            {header.label}
          </span>

          <div className="ts-header-subtext">
            <span className="tl-song-info">
              {tracks.length} Tracks &middot; {"  "}
              {beats.length} Beats &middot; {"  "}
              {duration && duration.toFixed(2)} seconds &middot; {"  "}
              {header.ppq} ticks/beat
            </span>
          </div>
        </div>
        <Icon
          name="close"
          size={16}
          onClick={onClose}
          className="absolute cursor-pointer top-0 right-0 m-5"
        />
      </div>
      <div className="ts-content">
        <div className="ts-section-title">
          <span className="text-base text-white">Tracks</span>
          <Switch
            checked={playingTracksIndex.length === tracks.length}
            marginRight={15}
            onChange={toggleAllTracks}
          />
        </div>

        <div className="flex flex-row flex-wrap">
          {midi &&
            tracks &&
            tracks.map((track: ITrack, i) => {
              const isSelectedTrack = selectedTrackIndex === i;
              return (
                <InstrumentCard
                  disabled={!playingTracksIndex.includes(i)}
                  onClick={() => selectTrack(i)}
                  isSelected={isSelectedTrack}
                  key={i}
                  instrumentName={track.instrument.name}
                  onIconClick={
                    !isSelectedTrack ? () => toggleTrack(i) : undefined
                  }
                />
              );
            })}
        </div>

        {midi && beats && !!beats.length && (
          <>
            <div className="ts-section-title">
              <span className="text-base text-white">Beats</span>
              <Switch
                checked={playingBeatsIndex.length === beats.length}
                marginRight={15}
                onChange={toggleAllBeats}
              />
            </div>
            <div className="flex flex-row flex-wrap">
              {beats.map((beat: IBeat, i) => (
                <InstrumentCard
                  disabled={!playingBeatsIndex.includes(i)}
                  isSelected={false}
                  drums
                  key={i}
                  instrumentName={beat.instrument.name}
                  onIconClick={() => toggleBeat(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="ts-footer">
        {tracks.length + beats.length > 1 ? (
          <Checkbox
            checked={playInstrumentsInBackground}
            marginY={0}
            label={
              <span className="text-13 text-white">
                Play other instruments in Background
              </span>
            }
            onChange={handleBackgroundPlayChange}
          />
        ) : (
          <span />
        )}
        <Button onClick={_onPlayClick} className="h-8">
          Play Track
        </Button>
      </div>
    </>
  );
}

export default React.memo(TrackSelection);
