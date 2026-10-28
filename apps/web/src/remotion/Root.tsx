import React from "react";
import { Composition } from "remotion";
import type { Locale } from "@physchem/experiment-schema";
import { COMPOSITIONS } from "./registry";

export const RemotionRoot: React.FC = () => (
  <>
    {Object.values(COMPOSITIONS).map((entry) => (
      <Composition
        key={entry.meta.id}
        id={entry.meta.compositionId}
        component={entry.component}
        durationInFrames={entry.durationInFrames}
        fps={entry.fps}
        width={entry.width}
        height={entry.height}
        defaultProps={{ lang: "zh-CN" as Locale, params: entry.defaultParams }}
      />
    ))}
  </>
);
