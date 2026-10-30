import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [300, 360, 390, 330];

export const voltmeterAmmeterResistanceMeta: ExperimentMeta = {
  id: "voltmeter-ammeter-resistance",
  category: "junior-physics",
  difficulty: 2,
  modes: ["animation"],
  compositionId: "voltmeter-ammeter-resistance",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const voltmeterAmmeterResistanceContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "voltmeter-ammeter-resistance",
    locale: "zh-CN",
    title: "伏安法测电阻",
    subtitle: "用电压表和电流表测定电阻",
    principle:
      "用电压表测出待测电阻两端的电压 U，用电流表测出通过它的电流 I，由欧姆定律的变形公式 R = U/I 即可求出电阻。电压表与被测电阻并联，电流表串联在电路中；滑动变阻器用来改变电路中的电流，获得多组数据以减小误差。",
    equipment: [
      "待测电阻（未知阻值）",
      "电压表（0～3 V、0～15 V）",
      "电流表（0～0.6 A、0～3 A）",
      "滑动变阻器（20 Ω）",
      "电源（干电池组）",
      "开关与导线",
    ],
    steps: [
      {
        index: 0,
        title: "连接电路",
        description:
          "按电路图连接：电流表串联在待测电阻所在支路，电压表并联在待测电阻两端；电流从两表的正接线柱流入、负接线柱流出，先选用较大量程试触。",
        keyPoint: "电流表串联、电压表并联，正进负出",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "检查并闭合开关",
        description:
          "闭合开关前把滑动变阻器调到阻值最大处；检查接线无误后试触，确认指针正向偏转再闭合开关，观察两表示数。",
        keyPoint: "变阻器置于最大阻值，试触后闭合开关",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "调节变阻器读数",
        description:
          "移动滑片改变接入电路的电阻，记录 3 组电压 U 和电流 I；每次读数后及时断开开关，防止电阻长时间通电发热。",
        keyPoint: "多组 U、I 读数",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "计算电阻并分析",
        description:
          "对每组数据用 R = U/I 求出电阻并取平均值；若电压表示数接近零而电流表偏大，说明待测电阻被短路。",
        keyPoint: "R = U/I 与误差分析",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "supplyVoltage", label: "电源电压", min: 1, max: 6, step: 0.5, unit: "V", defaultValue: 4 },
      { kind: "slider", id: "fixedResistance", label: "待测电阻", min: 5, max: 50, step: 1, unit: "Ω", defaultValue: 10 },
      { kind: "slider", id: "rheostatFraction", label: "滑动变阻器接入比例", min: 0, max: 1, step: 0.05, unit: "", defaultValue: 0.4 },
      {
        kind: "select",
        id: "connection",
        label: "电路接法",
        options: [
          { value: "correct", label: "正确接法（电流表串联、电压表并联）" },
          { value: "ammeterParallel", label: "电流表并联在电阻两端" },
          { value: "voltmeterSeries", label: "电压表串联在干路" },
        ],
        defaultValue: "correct",
      },
      { kind: "toggle", id: "switchClosed", label: "开关闭合", defaultValue: true },
    ],
    safetyNotes: [
      "连接电路时开关必须断开，改接导线前先断开电源",
      "电表要先选大量程试触，严禁超量程使用",
      "通电时间不宜过长，发现电阻发热或有焦味立即断开开关",
    ],
    normalRanges: [
      {
        parameterId: "rheostatFraction",
        min: 0.15,
        max: 0.85,
        label: "变阻器接入比例",
        note: "过小或过大时调节余量不足",
      },
    ],
    errorScenarios: [
      {
        id: "ammeter-short",
        label: "电流表并联在电阻两端",
        triggerParam: "connection",
        triggerValue: "ammeterParallel",
        consequence: "待测电阻被电流表短路，电压表读数近似为零而电流过大，无法测出电阻",
        visualCue: "电流表示数突增、电压表回零，电阻两端被红导线短接",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "用伏安法测电阻时，电流表应与待测电阻——",
        options: [
          { id: "a", text: "串联在电路中" },
          { id: "b", text: "并联在待测电阻两端" },
          { id: "c", text: "串联在电压表两端" },
          { id: "d", text: "串联或并联都可以" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "电流表内阻很小，必须串联在待测电阻所在支路，才能测出通过电阻的电流；若并联在电阻两端，相当于把电阻短路。",
      },
      {
        id: "q2",
        type: "single",
        stem: "用伏安法测电阻时，电压表应——",
        options: [
          { id: "a", text: "串联在干路中" },
          { id: "b", text: "并联在待测电阻两端" },
          { id: "c", text: "串联在待测电阻支路中" },
          { id: "d", text: "并联在开关两端" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "电压表内阻很大，只有并联在待测电阻两端，测得的才是电阻两端的电压；若串联在电路中，电路电流几乎为零。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "下列操作中，会损坏电表或测不出电阻的是（多选）",
        options: [
          { id: "a", text: "量程选得过小" },
          { id: "b", text: "正负接线柱接反" },
          { id: "c", text: "电流表并联在电阻两端" },
          { id: "d", text: "开关断开时读数" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "量程过小会使指针打满甚至损坏电表；接线柱接反时指针反向偏转，可能损坏表头；电流表并联会把待测电阻短路。开关断开只是没有示数，不会损坏电表，闭合后即可测量。",
      },
    ],
  },
  "en-US": {
    experimentId: "voltmeter-ammeter-resistance",
    locale: "en-US",
    title: "Measuring Resistance with a Voltmeter and Ammeter",
    subtitle: "Determine R from voltage and current readings",
    principle:
      "The voltmeter reads the voltage U across the unknown resistor and the ammeter reads the current I through it, so Ohm's law gives R = U/I. The voltmeter is connected in parallel with the resistor and the ammeter in series; the sliding rheostat changes the current so that several data pairs can be averaged.",
    equipment: [
      "Unknown resistor",
      "Voltmeter (0–3 V, 0–15 V)",
      "Ammeter (0–0.6 A, 0–3 A)",
      "Sliding rheostat (20 Ω)",
      "DC power supply (battery pack)",
      "Switch and connecting leads",
    ],
    steps: [
      {
        index: 0,
        title: "Connect the circuit",
        description:
          "Wire the ammeter in series with the unknown resistor and the voltmeter in parallel across it. Current enters the positive terminal of each meter; start with the larger range and touch the circuit briefly to test.",
        keyPoint: "Ammeter in series, voltmeter in parallel, positive in",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Check and close the switch",
        description:
          "Set the rheostat to its maximum resistance first. After a brief test shows the pointers deflect the right way, close the switch and watch both meters.",
        keyPoint: "Rheostat at maximum, test then close",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Adjust the rheostat and read meters",
        description:
          "Move the slider to change the circuit resistance and record three pairs of voltage and current readings. Open the switch after each reading so the resistor does not overheat.",
        keyPoint: "Several U–I pairs",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Calculate R and analyse errors",
        description:
          "Compute R = U/I for each pair and average the results. If the voltmeter reads nearly zero while the ammeter reads high, the resistor is short-circuited.",
        keyPoint: "R = U/I and error analysis",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "supplyVoltage", label: "Supply voltage", min: 1, max: 6, step: 0.5, unit: "V", defaultValue: 4 },
      { kind: "slider", id: "fixedResistance", label: "Unknown resistance", min: 5, max: 50, step: 1, unit: "Ω", defaultValue: 10 },
      { kind: "slider", id: "rheostatFraction", label: "Rheostat fraction", min: 0, max: 1, step: 0.05, unit: "", defaultValue: 0.4 },
      {
        kind: "select",
        id: "connection",
        label: "Connection",
        options: [
          { value: "correct", label: "Correct (ammeter in series, voltmeter in parallel)" },
          { value: "ammeterParallel", label: "Ammeter in parallel with the resistor" },
          { value: "voltmeterSeries", label: "Voltmeter in series with the circuit" },
        ],
        defaultValue: "correct",
      },
      { kind: "toggle", id: "switchClosed", label: "Switch closed", defaultValue: true },
    ],
    safetyNotes: [
      "Keep the switch open while wiring, and disconnect the supply before changing any lead",
      "Always test with the larger meter range first; never exceed the range",
      "Do not leave the circuit energised for long; switch off at once if the resistor heats up or smells hot",
    ],
    normalRanges: [
      {
        parameterId: "rheostatFraction",
        min: 0.15,
        max: 0.85,
        label: "Rheostat fraction",
        note: "Too small or too large leaves little adjustment range",
      },
    ],
    errorScenarios: [
      {
        id: "ammeter-short",
        label: "Ammeter in parallel with the resistor",
        triggerParam: "connection",
        triggerValue: "ammeterParallel",
        consequence:
          "The ammeter short-circuits the resistor: voltage collapses to zero, current surges and R cannot be measured",
        visualCue:
          "The ammeter reading jumps, the voltmeter drops to zero and a red lead shorts the resistor",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "In the volt–ammeter method, the ammeter must be connected —",
        options: [
          { id: "a", text: "in series in the circuit" },
          { id: "b", text: "in parallel across the unknown resistor" },
          { id: "c", text: "in series with the voltmeter" },
          { id: "d", text: "in series or in parallel, either works" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "The ammeter has a very small resistance and must be in series with the resistor to measure the current through it; in parallel it would short the resistor.",
      },
      {
        id: "q2",
        type: "single",
        stem: "In the volt–ammeter method, the voltmeter should be connected —",
        options: [
          { id: "a", text: "in series in the main circuit" },
          { id: "b", text: "in parallel across the unknown resistor" },
          { id: "c", text: "in series with the unknown resistor" },
          { id: "d", text: "in parallel across the switch" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "The voltmeter has a very large resistance. Only when it is in parallel across the resistor does it read the voltage across it; in series the current would be almost zero.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "Which of these damage the meters or make R unmeasurable? (multiple answers)",
        options: [
          { id: "a", text: "Choosing a range that is too small" },
          { id: "b", text: "Reversing the positive and negative terminals" },
          { id: "c", text: "Connecting the ammeter in parallel with the resistor" },
          { id: "d", text: "Reading the meters while the switch is open" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "Too small a range drives the pointer past full scale and can damage the meter; reversed terminals make the pointer deflect backwards; an ammeter in parallel shorts the resistor. An open switch only gives zero readings, so close it and measure again.",
      },
    ],
  },
};
