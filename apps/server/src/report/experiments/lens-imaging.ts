import type { CalculationStep, MeasurementRow } from "@physchem/experiment-schema";
import { lensCase, thinLensImage } from "@physchem/experiment-data";
import { num, relErr, type Calculator } from "../types";

export const lensImagingCalculator: Calculator = ({ locale, params, rng }) => {
  const zh = locale !== "en-US";
  const f = num(params, "focalLength", 10);
  const u = num(params, "objectDistance", 30);
  const offset = num(params, "screenOffset", 0);

  const image = thinLensImage(f, u);
  const kind = lensCase(f, u);
  const trialU = [2.5 * f, 2 * f, 1.5 * f, u].filter((v, i, arr) => arr.indexOf(v) === i);

  const measurements: MeasurementRow[] = trialU.map((ui, i) => {
    const vi = thinLensImage(f, ui).imageDistance;
    const vMeasured = vi + (rng() - 0.5) * 0.6;
    return {
      index: i + 1,
      values: {
        u_cm: Number(ui.toFixed(1)),
        v_cm: Number(vMeasured.toFixed(2)),
        magnification: Number(Math.abs(vMeasured / ui).toFixed(2)),
      },
      unit: { u_cm: "cm", v_cm: "cm", magnification: "" },
    };
  });

  const fValues = measurements.map(
    (row) => (row.values.u_cm * row.values.v_cm) / (row.values.u_cm + row.values.v_cm),
  );
  const fMean = fValues.reduce((a, b) => a + b, 0) / fValues.length;
  const err = relErr(fMean, f);

  const calculations: CalculationStep[] = [
    {
      label: zh ? "焦距（逐组由 u、v 反算）" : "Focal length from each (u, v) pair",
      formula: "f = \\frac{u v}{u + v}",
      result: Number(fMean.toFixed(2)),
      unit: "cm",
    },
    {
      label: zh ? "像距（薄透镜公式）" : "Image distance (thin-lens equation)",
      formula: "v = \\frac{u f}{u - f}",
      result: Number.isFinite(image.imageDistance) ? Number(image.imageDistance.toFixed(2)) : 0,
      unit: "cm",
    },
    {
      label: zh ? "放大率" : "Magnification",
      formula: "|m| = \\frac{|v|}{u}",
      result: Number.isFinite(image.magnification)
        ? Number(Math.abs(image.magnification).toFixed(2))
        : 0,
      unit: "",
    },
    {
      label: zh ? "焦距相对误差" : "Relative error of f",
      formula: "\\frac{|f_{meas} - f|}{f} \\times 100\\%",
      result: Number(err.toFixed(2)),
      unit: "%",
    },
  ];

  const warnings: string[] = [];
  if (kind === "none") {
    warnings.push(
      zh
        ? "物距等于焦距，折射光线平行射出，光屏上不能成像。"
        : "The object sits at the focal point; emerging rays are parallel and no image forms.",
    );
  } else if (kind === "virtual") {
    warnings.push(
      zh
        ? "物距小于焦距，成的是正立放大的虚像，不能用光屏承接。"
        : "u < f gives an upright, magnified virtual image that a screen cannot catch.",
    );
  }
  if (Math.abs(offset) > 1.5) {
    warnings.push(
      zh
        ? `光屏偏离像的位置 ${offset.toFixed(1)} cm，屏上像模糊，像距读数不可靠。`
        : `The screen is ${Math.abs(offset).toFixed(1)} cm off the image plane; the blur makes the image distance unreliable.`,
    );
  }

  const kindText = {
    "reduced-real": zh ? "倒立、缩小的实像" : "inverted and reduced real image",
    "equal-real": zh ? "倒立、等大的实像" : "inverted, same-size real image",
    "magnified-real": zh ? "倒立、放大的实像" : "inverted and magnified real image",
    virtual: zh ? "正立、放大的虚像" : "upright, magnified virtual image",
    none: zh ? "不成像" : "no image",
  }[kind];

  const errorAnalysis = zh
    ? `本组数据的平均焦距为 ${fMean.toFixed(2)} cm，与标称值 ${f.toFixed(1)} cm 相比相对误差 ${err.toFixed(1)}%。误差主要来自：${Math.abs(offset) > 1.5 ? "光屏没有停在像的位置，" : "光屏位置凭视觉判断最清晰处，本身有"}读数偏差；透镜中心高度与光具座刻度未严格对齐；透镜存在一定的球面像差。${kind === "virtual" || kind === "none" ? "此外，本次物距条件下光屏无法承接实像，像距只能由公式推算。" : ""}`
    : `The mean focal length is ${fMean.toFixed(2)} cm, giving a relative error of ${err.toFixed(1)}% against the nominal ${f.toFixed(1)} cm. The deviation comes from ${Math.abs(offset) > 1.5 ? "the screen being off the image plane" : "judging the sharpest position by eye"}, imperfect height alignment on the bench, and spherical aberration of the lens.${kind === "virtual" || kind === "none" ? " Under this object distance the screen cannot catch a real image, so the image distance is predicted from the lens equation." : ""}`;

  const conclusion = zh
    ? `在 f = ${f.toFixed(1)} cm 的凸透镜下，物距 u = ${u.toFixed(1)} cm 时成${kindText}${Number.isFinite(image.imageDistance) ? `，像距 v = ${image.imageDistance.toFixed(1)} cm，放大率 |m| = ${Math.abs(image.magnification).toFixed(2)}` : ""}，与 1/f = 1/u + 1/v 的计算结果一致。`
    : `With f = ${f.toFixed(1)} cm and the object at u = ${u.toFixed(1)} cm, the lens forms an ${kindText}${Number.isFinite(image.imageDistance) ? ` at v = ${image.imageDistance.toFixed(1)} cm with |m| = ${Math.abs(image.magnification).toFixed(2)}` : ""}, consistent with 1/f = 1/u + 1/v.`;

  return { measurements, calculations, errorAnalysis, conclusion, warnings };
};
