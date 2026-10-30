import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import { clamp, getExperimentContent, measuredResistance } from "@physchem/experiment-data";
import { CurvePlot, type CurvePoint } from "../shared/CurvePlot";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const STROKE = "var(--border-strong, #C4BFB6)";
const LINE = "var(--border-default, #DDD9D2)";
const SUBTLE = "var(--bg-subtle, #EFEDE8)";
const SURFACE = "var(--bg-surface, #FFFFFF)";
const INK = "var(--text-primary, #2B2A27)";
const INK_SECONDARY = "var(--text-secondary, #6B6862)";
const MUTED = "var(--text-muted, #9C9890)";
const ACCENT = "var(--accent, #4A6B5D)";
const CURRENT_COLOR = "#B5762F"; // 电荷数据色
const FAULT = "#B4432F";

const LEFT_X = 220;
const RIGHT_X = 1020;
const TOP_Y = 150;
const BOTTOM_Y = 470;
const RHEO_X = 620;
const RHEO_W = 200;

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

/** 沿矩形回路取点，t ∈ [0,1) 顺时针一圈 */
function loopPoint(t: number): { x: number; y: number } {
  const w = RIGHT_X - LEFT_X;
  const h = BOTTOM_Y - TOP_Y;
  let d = (((t % 1) + 1) % 1) * (2 * w + 2 * h);
  if (d <= w) return { x: LEFT_X + d, y: TOP_Y };
  d -= w;
  if (d <= h) return { x: RIGHT_X, y: TOP_Y + d };
  d -= h;
  if (d <= w) return { x: RIGHT_X - d, y: BOTTOM_Y };
  d -= w;
  return { x: LEFT_X, y: BOTTOM_Y - d };
}

const Wire: React.FC<{ d: string; progress: number; color?: string; width?: number }> = ({
  d,
  progress,
  color = STROKE,
  width = 2.5,
}) => (
  <path
    d={d}
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    pathLength={1}
    strokeDasharray="1 1"
    strokeDashoffset={1 - progress}
  />
);

const LABELS = {
  "zh-CN": {
    readings: "测量读数",
    voltage: "电压 U",
    current: "电流 I",
    resistance: "电阻 R = U/I",
    supply: "电源电压",
    rheostat: "变阻器接入比例",
    switchState: "开关状态",
    closed: "闭合",
    open: "断开",
    connectTitle: "接线要点",
    connect1: "电流表串联在待测电阻所在支路",
    connect2: "电压表并联在待测电阻两端",
    connect3: "电流从正接线柱流入，先选大量程试触",
    checkTitle: "闭合开关前的检查",
    check1: "把滑动变阻器调到最大阻值",
    check2: "检查接线，试触时指针正向偏转",
    check3: "读数后及时断开开关，防止电阻发热",
    pairTitle: "变阻器与读数",
    pairHint: "移动滑片，待指针稳定后读数，至少记录 3 组 U、I 再取平均。",
    rheostatValue: "接入电阻",
    plot: "I–U 图像",
    xLabel: "U / V",
    yLabel: "I / A",
    plotHint: "图线为过原点的直线，斜率等于 1/R，可由斜率求出电阻。",
    shorted: "电流表并联在电阻两端：待测电阻被短路，电压表回零",
    openWarning: "开关断开，电路中没有电流，两表均无示数",
    seriesWarning: "电压表串联在干路：电流几乎为零，测得的是电压表内阻",
    correct: "接法正确，两表均有正常示数",
    unmeasurable: "—",
    resistor: "待测电阻",
    ammeter: "电流表",
    voltmeter: "电压表",
    rheostatName: "滑动变阻器",
    battery: "电源",
    switchName: "开关",
    shortLead: "短路",
    seriesPosition: "电压表",
    charge: "电流方向",
  },
  "en-US": {
    readings: "Readings",
    voltage: "Voltage U",
    current: "Current I",
    resistance: "Resistance R = U/I",
    supply: "Supply voltage",
    rheostat: "Rheostat setting",
    switchState: "Switch",
    closed: "Closed",
    open: "Open",
    connectTitle: "Wiring points",
    connect1: "Ammeter in series with the unknown resistor",
    connect2: "Voltmeter in parallel across the resistor",
    connect3: "Current enters the positive terminal; test on the larger range",
    checkTitle: "Checks before closing",
    check1: "Set the rheostat to its maximum resistance",
    check2: "Check the wiring; the pointers should deflect forwards",
    check3: "Open the switch after each reading to avoid overheating",
    pairTitle: "Rheostat and readings",
    pairHint: "Move the slider, wait for steady pointers and record at least three U–I pairs before averaging.",
    rheostatValue: "Inserted resistance",
    plot: "I–U graph",
    xLabel: "U / V",
    yLabel: "I / A",
    plotHint: "The line passes through the origin with slope 1/R, so R follows from the slope.",
    shorted: "Ammeter in parallel: the resistor is short-circuited and the voltmeter drops to zero",
    openWarning: "The switch is open, so no current flows and both meters read zero",
    seriesWarning: "Voltmeter in series: the current is almost zero and its own resistance is measured",
    correct: "Correct wiring; both meters read normally",
    unmeasurable: "—",
    resistor: "Unknown resistor",
    ammeter: "Ammeter",
    voltmeter: "Voltmeter",
    rheostatName: "Rheostat",
    battery: "Supply",
    switchName: "Switch",
    shortLead: "Short",
    seriesPosition: "Voltmeter",
    charge: "Current",
  },
} as const;

export const VoltmeterAmmeterResistance: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("voltmeter-ammeter-resistance", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];

  const supply = Number(params.supplyVoltage);
  const resistance = Number(params.fixedResistance);
  const fraction = Number(params.rheostatFraction);
  const connection = String(params.connection);
  const switchClosed = params.switchClosed !== false;

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const s1 = scenes[1].startFrame;
  const s3 = scenes[3].startFrame;

  const reading = measuredResistance(supply, resistance, connection, fraction);
  const shorted = connection === "ammeterParallel";
  const voltmeterSeries = connection === "voltmeterSeries";
  const live = switchClosed;
  const current = live ? reading.current : 0;
  const voltage = live ? reading.voltage : 0;
  const measuredR = current > 1e-6 ? voltage / current : NaN;

  const wireProgress = clamp(frame / 140, 0, 1);
  const bladeAngle = switchClosed
    ? interpolate(frame, [s1, s1 + 36], [-34, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : -34;
  const bladeRad = (bladeAngle * Math.PI) / 180;
  const bladeEnd = {
    x: 330 + 80 * Math.cos(bladeRad),
    y: TOP_Y + 80 * Math.sin(bladeRad),
  };
  const wiperX = RHEO_X + fraction * RHEO_W;

  const dots: { x: number; y: number }[] = [];
  if (live && current >= 1e-4) {
    const speed = clamp(current, 0, 2) * 0.045;
    for (let i = 0; i < 22; i++) {
      dots.push(loopPoint(i / 22 + frame * speed));
    }
  }

  const xMax = Math.max(0.1, supply);
  const plotYMax = Math.max(0.1, Math.ceil((supply / Math.max(1, resistance)) * 10) / 10);
  const points = useMemo<CurvePoint[]>(() => {
    const arr: CurvePoint[] = [];
    for (let i = 0; i <= 60; i++) {
      const u = (i / 60) * xMax;
      arr.push({ x: u, y: measuredResistance(u, resistance, "correct", fraction).current });
    }
    return arr;
  }, [xMax, resistance, fraction]);
  const drawnX = interpolate(frame, [s3, s3 + 90], [0, xMax], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showPlot = sceneIndex === 3;

  const status = shorted
    ? L.shorted
    : voltmeterSeries
      ? L.seriesWarning
      : !switchClosed
        ? L.openWarning
        : L.correct;
  const statusColor = shorted || voltmeterSeries || !switchClosed ? FAULT : ACCENT;
  const currentText =
    current > 0 && current < 0.01 ? current.toFixed(4) : current.toFixed(3);
  const resistanceText = Number.isFinite(measuredR) ? measuredR.toFixed(1) : L.unmeasurable;

  return (
    <>
      <StageFrame
        title={content.title}
        subtitle={content.subtitle}
        scene={scenes[sceneIndex]}
        sceneIndex={sceneIndex}
        sceneCount={scenes.length}
        lang={locale}
      >
        <div style={{ flex: 1.4, minWidth: 0 }}>
          <svg viewBox="0 0 1240 620" style={{ width: "100%", height: "100%" }}>
            {/* 主回路导线（逐段展开） */}
            <Wire d={`M ${LEFT_X} ${TOP_Y} L 330 ${TOP_Y}`} progress={wireProgress} />
            <Wire d={`M 410 ${TOP_Y} L ${RHEO_X} ${TOP_Y}`} progress={wireProgress} />
            <Wire d={`M ${RHEO_X + RHEO_W} ${TOP_Y} L ${RIGHT_X} ${TOP_Y}`} progress={wireProgress} />
            <Wire d={`M ${RIGHT_X} ${TOP_Y} L ${RIGHT_X} ${BOTTOM_Y}`} progress={wireProgress} />
            <Wire d={`M ${RIGHT_X} ${BOTTOM_Y} L 880 ${BOTTOM_Y}`} progress={wireProgress} />
            <Wire d={`M 820 ${BOTTOM_Y} L 680 ${BOTTOM_Y}`} progress={wireProgress} />
            <Wire d={`M 520 ${BOTTOM_Y} L ${LEFT_X} ${BOTTOM_Y}`} progress={wireProgress} />
            <Wire d={`M ${LEFT_X} ${BOTTOM_Y} L ${LEFT_X} 316`} progress={wireProgress} />
            <Wire d={`M ${LEFT_X} 300 L ${LEFT_X} ${TOP_Y}`} progress={wireProgress} />

            {/* 电源 */}
            <g opacity={clamp((wireProgress - 0.35) / 0.25, 0, 1)}>
              <line x1={194} y1={300} x2={246} y2={300} stroke={INK} strokeWidth={3} />
              <line x1={204} y1={316} x2={236} y2={316} stroke={INK} strokeWidth={3} />
              <text x={186} y={286} fontSize={14} fill={INK_SECONDARY} textAnchor="end">
                {L.battery}
              </text>
              <text x={186} y={306} fontSize={13} fill={MUTED} textAnchor="end">
                {supply.toFixed(1)} V
              </text>
            </g>

            {/* 开关 */}
            <g opacity={clamp((wireProgress - 0.2) / 0.25, 0, 1)}>
              <circle cx={330} cy={TOP_Y} r={4.5} fill={SURFACE} stroke={STROKE} strokeWidth={2} />
              <circle cx={410} cy={TOP_Y} r={4.5} fill={SURFACE} stroke={STROKE} strokeWidth={2} />
              <line
                x1={330}
                y1={TOP_Y}
                x2={bladeEnd.x}
                y2={bladeEnd.y}
                stroke={INK}
                strokeWidth={3.5}
                strokeLinecap="round"
              />
              <text x={370} y={TOP_Y + 34} fontSize={13} fill={INK_SECONDARY} textAnchor="middle">
                {L.switchName}
              </text>
            </g>

            {/* 滑动变阻器 */}
            <g opacity={clamp((wireProgress - 0.3) / 0.3, 0, 1)}>
              <rect
                x={RHEO_X}
                y={126}
                width={RHEO_W}
                height={48}
                rx={3}
                fill={SUBTLE}
                stroke={STROKE}
                strokeWidth={2.5}
              />
              <line x1={RHEO_X} y1={TOP_Y} x2={RHEO_X + RHEO_W} y2={TOP_Y} stroke={LINE} strokeWidth={1} />
              <line x1={wiperX} y1={96} x2={wiperX} y2={TOP_Y} stroke={INK} strokeWidth={2.5} />
              <polygon
                points={`${wiperX - 7},${TOP_Y - 12} ${wiperX + 7},${TOP_Y - 12} ${wiperX},${TOP_Y + 2}`}
                fill={INK}
              />
              <line x1={wiperX - 13} y1={96} x2={wiperX + 13} y2={96} stroke={INK} strokeWidth={2.5} />
              <text x={RHEO_X + RHEO_W / 2} y={82} fontSize={14} fill={INK_SECONDARY} textAnchor="middle">
                {L.rheostatName}
              </text>
              <text x={RHEO_X + RHEO_W / 2} y={196} fontSize={13} fill={MUTED} textAnchor="middle">
                {(fraction * 100).toFixed(0)}% · {(20 * fraction).toFixed(1)} Ω
              </text>
            </g>

            {/* 待测电阻 */}
            <g opacity={clamp((wireProgress - 0.55) / 0.25, 0, 1)}>
              <rect x={520} y={452} width={160} height={36} rx={2} fill={SURFACE} stroke={STROKE} strokeWidth={2.5} />
              <text x={600} y={477} fontSize={18} fill={INK} textAnchor="middle">
                R
              </text>
              <text x={600} y={512} fontSize={13} fill={INK_SECONDARY} textAnchor="middle">
                {L.resistor}
              </text>
            </g>

            {/* 电流表（串联） */}
            <g opacity={clamp((wireProgress - 0.7) / 0.25, 0, 1)}>
              <circle cx={850} cy={BOTTOM_Y} r={30} fill={SURFACE} stroke={STROKE} strokeWidth={2.5} />
              <text x={850} y={BOTTOM_Y + 7} fontSize={20} fill={INK} textAnchor="middle">
                A
              </text>
              <text x={850} y={526} fontSize={13} fill={INK_SECONDARY} textAnchor="middle">
                {L.ammeter}
              </text>
              <text x={850} y={550} fontSize={16} fill={INK} textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
                {currentText} A
              </text>
            </g>

            {/* 电压表（并联支路 / 串联故障） */}
            <g opacity={clamp((wireProgress - 0.75) / 0.25, 0, 1)}>
              <g opacity={voltmeterSeries ? 0.28 : 1}>
                <Wire d={`M 520 ${BOTTOM_Y} L 520 580 L 572 580`} progress={wireProgress} />
                <Wire d={`M 628 580 L 680 580 L 680 ${BOTTOM_Y}`} progress={wireProgress} />
                <circle cx={600} cy={580} r={28} fill={SURFACE} stroke={STROKE} strokeWidth={2.5} strokeDasharray={voltmeterSeries ? "6 5" : undefined} />
                <text x={600} y={587} fontSize={19} fill={voltmeterSeries ? MUTED : INK} textAnchor="middle">
                  V
                </text>
                <text x={600} y={540} fontSize={12.5} fill={MUTED} textAnchor="middle">
                  {L.voltmeter}
                </text>
                <text x={568} y={585} fontSize={14} fill={INK} textAnchor="end" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {voltage.toFixed(2)} V
                </text>
              </g>
              {voltmeterSeries ? (
                <g>
                  <circle cx={RIGHT_X} cy={310} r={30} fill={SURFACE} stroke={STROKE} strokeWidth={2.5} />
                  <text x={RIGHT_X} y={317} fontSize={20} fill={INK} textAnchor="middle">
                    V
                  </text>
                  <text x={RIGHT_X - 42} y={314} fontSize={13} fill={INK_SECONDARY} textAnchor="end">
                    {L.seriesPosition}
                  </text>
                </g>
              ) : null}
            </g>

            {/* 短路故障：红色导线跨接待测电阻 */}
            {shorted ? (
              <g>
                <path d="M 520 470 Q 600 404 680 470" fill="none" stroke={FAULT} strokeWidth={5} strokeLinecap="round" />
                <circle cx={600} cy={412} r={15} fill={SURFACE} stroke={FAULT} strokeWidth={2.5} />
                <text x={600} y={418} fontSize={15} fill={FAULT} textAnchor="middle">
                  A
                </text>
                <text x={624} y={410} fontSize={14} fill={FAULT} fontWeight={600}>
                  {L.shortLead}
                </text>
              </g>
            ) : null}

            {/* 移动电荷：速度随电流增大 */}
            {dots.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4.2} fill={CURRENT_COLOR} opacity={0.9} />
            ))}

            {/* 接法状态 */}
            <g>
              <rect
                x={40}
                y={24}
                width={500}
                height={42}
                rx={4}
                fill={SURFACE}
                stroke={shorted || voltmeterSeries || !switchClosed ? FAULT : LINE}
                strokeWidth={1.2}
              />
              <circle cx={62} cy={45} r={5} fill={statusColor} />
              <text x={78} y={50} fontSize={14} fill={statusColor}>
                {status}
              </text>
            </g>

            {dots.length > 0 ? (
              <text x={LEFT_X + 8} y={122} fontSize={12} fill={MUTED}>
                {L.charge}
              </text>
            ) : null}
          </svg>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.readings}>
            <Reading label={L.voltage} value={voltage.toFixed(2)} unit="V" highlight={!shorted && switchClosed} />
            <Reading label={L.current} value={currentText} unit="A" highlight={!shorted && switchClosed && !voltmeterSeries} />
            <Reading
              label={L.resistance}
              value={resistanceText}
              unit={Number.isFinite(measuredR) ? "Ω" : undefined}
              highlight={!shorted && !voltmeterSeries && switchClosed}
            />
            <Reading label={L.supply} value={supply.toFixed(1)} unit="V" />
            <Reading label={L.rheostat} value={(fraction * 100).toFixed(0)} unit="%" />
            <Reading label={L.switchState} value={switchClosed ? L.closed : L.open} />
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${LINE}` }}>
              <div style={{ fontSize: 14, color: INK_SECONDARY, marginBottom: 4 }}>R = U / I</div>
              <div
                style={{
                  fontSize: 21,
                  color: INK,
                  fontFamily: "ui-monospace, Menlo, monospace",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                = {voltage.toFixed(2)} / {currentText} = {resistanceText} Ω
              </div>
            </div>
          </Panel>

          <Panel
            title={
              sceneIndex === 0
                ? L.connectTitle
                : sceneIndex === 1
                  ? L.checkTitle
                  : sceneIndex === 2
                    ? L.pairTitle
                    : L.plot
            }
            style={{ flex: 1, minHeight: 0 }}
          >
            {sceneIndex === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 16, color: INK_SECONDARY, lineHeight: 1.5 }}>
                <div>{L.connect1}</div>
                <div>{L.connect2}</div>
                <div>{L.connect3}</div>
                <div style={{ fontSize: 14, color: MUTED }}>A: 0–0.6 A / 0–3 A · V: 0–3 V / 0–15 V</div>
              </div>
            ) : null}

            {sceneIndex === 1 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 16, color: INK_SECONDARY, lineHeight: 1.5 }}>
                <div>{L.check1}</div>
                <div>{L.check2}</div>
                <div>{L.check3}</div>
                <div style={{ marginTop: 4, fontSize: 15, color: statusColor }}>{status}</div>
              </div>
            ) : null}

            {sceneIndex === 2 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: INK_SECONDARY }}>
                  <span>{L.rheostatValue}</span>
                  <span style={{ color: INK, fontVariantNumeric: "tabular-nums" }}>{(20 * fraction).toFixed(1)} Ω</span>
                </div>
                <div
                  style={{
                    fontSize: 20,
                    color: INK,
                    fontFamily: "ui-monospace, Menlo, monospace",
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1.8,
                  }}
                >
                  <div>U = {voltage.toFixed(2)} V</div>
                  <div>I = {currentText} A</div>
                  <div style={{ color: ACCENT }}>R = {resistanceText} Ω</div>
                </div>
                <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.5 }}>{L.pairHint}</div>
              </div>
            ) : null}

            {showPlot ? (
              <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {shorted ? (
                  <div style={{ fontSize: 15, color: FAULT, lineHeight: 1.5 }}>{L.shorted}</div>
                ) : (
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <CurvePlot
                      width={620}
                      height={380}
                      xMax={xMax}
                      yMin={0}
                      yMax={plotYMax}
                      xTicks={[0, Number((xMax / 2).toFixed(1)), Number(xMax.toFixed(1))]}
                      yTicks={[0, Number((plotYMax / 2).toFixed(2)), Number(plotYMax.toFixed(2))]}
                      xLabel={L.xLabel}
                      yLabel={L.yLabel}
                      points={points}
                      drawnX={drawnX}
                      color={ACCENT}
                      marker={
                        voltage > 0
                          ? {
                              x: voltage,
                              label: `${voltage.toFixed(2)} V, ${currentText} A`,
                            }
                          : undefined
                      }
                    />
                  </div>
                )}
                <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.5 }}>{L.plotHint}</div>
              </div>
            ) : null}
          </Panel>
        </div>
      </StageFrame>
      <SceneCaption scene={scenes[sceneIndex]} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};
