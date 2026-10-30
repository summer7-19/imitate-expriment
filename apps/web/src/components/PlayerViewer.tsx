import { Player, type CallbackListener, type PlayerRef } from "@remotion/player";
import type { Locale, ParamValues } from "@physchem/experiment-schema";
import { useEffect, useState } from "react";
import { formatTimecode } from "../lib/api";
import { useI18n } from "../i18n/I18nContext";
import type { CompositionEntry } from "../remotion/registry";
import { Button } from "./ui/Button";
import { Slider } from "./ui/Slider";
import styles from "./PlayerViewer.module.scss";

/**
 * 播放器容器 + 自定义控件条（PlayerViewer，规范 7.2）：
 * 控件条背景 bg-subtle（不用半透明黑遮罩），进度条已播放 accent；
 * 参数通过 inputProps 更新，不重新挂载 Player；默认不自动播放。
 * playerRef 由页面持有，时间线/外部控件可直接 seekTo。
 */
export function PlayerViewer({
  entry,
  locale,
  params,
  playerRef,
  onFrame,
}: {
  entry: CompositionEntry;
  locale: Locale;
  params: ParamValues;
  playerRef: React.RefObject<PlayerRef>;
  onFrame: (frame: number) => void;
}) {
  const { t } = useI18n();
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onFrameUpdate: CallbackListener<"frameupdate"> = (e) => {
      setFrame(e.detail.frame);
      onFrame(e.detail.frame);
    };
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("frameupdate", onFrameUpdate);
    return () => {
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("frameupdate", onFrameUpdate);
    };
  }, [onFrame, playerRef]);

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isPlaying()) player.pause();
    else player.play();
  };

  const total = entry.durationInFrames;
  const durationInSeconds = total / entry.fps;

  return (
    <div className={styles.wrapper}>
      <Player
        ref={playerRef}
        component={entry.component}
        inputProps={{ lang: locale, params }}
        durationInFrames={total}
        fps={entry.fps}
        compositionWidth={entry.width}
        compositionHeight={entry.height}
        style={{
          width: "100%",
          aspectRatio: `${entry.width} / ${entry.height}`,
          borderRadius: 6,
          overflow: "hidden",
        }}
      />
      <div className={styles.controls}>
        <Button variant="secondary" onClick={togglePlay} aria-label={playing ? t("player.pause") : t("player.play")}>
          {playing ? t("player.pause") : t("player.play")}
        </Button>
        <div className={styles.sliderBox}>
          <Slider
            min={0}
            max={total}
            step={1}
            value={frame}
            onChange={(v) => playerRef.current?.seekTo(v)}
            ariaLabel={t("player.progress")}
          />
        </div>
        <span className={styles.timecode} aria-label={t("player.timecode")}>
          {formatTimecode(frame / entry.fps)} / {formatTimecode(durationInSeconds)}
        </span>
      </div>
    </div>
  );
}
