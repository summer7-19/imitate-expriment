import type { VirtualOpsCheckResult, VirtualOperationPublic } from "@physchem/experiment-schema";
import { defaultParams, type ParamValues } from "@physchem/experiment-schema";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ActionBar,
  CheckpointFeedback,
} from "../components/VirtualOpsControls";
import { AcidBenchScene, ConductScene, SlitScene } from "../components/VirtualOpsScene";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { useI18n } from "../i18n/I18nContext";
import {
  checkVirtualOps,
  fetchExperiment,
  fetchVirtualOps,
  type ExperimentBundle,
} from "../lib/api";
import { useParamsStore } from "../stores/params";
import styles from "./VirtualOpsPage.module.scss";

interface Feedback {
  text: string;
  kind: "info" | "ok" | "err";
}

export function VirtualOpsPage() {
  const { id } = useParams();
  const { t, tf, locale } = useI18n();
  const [vops, setVops] = useState<VirtualOperationPublic | null>(null);
  const [bundle, setBundle] = useState<ExperimentBundle | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0, done: false });
  const [measure, setMeasure] = useState("");

  // 酸碱实验台模拟状态
  const [bench, setBench] = useState({ indicator: false, stopcock: false, delivered: 0, swirls: 0 });

  const params: ParamValues = bundle ? defaultParams(bundle.content) : {};
  const ve =
    params.acidConcentration && params.baseConcentration && params.acidVolume
      ? (Number(params.acidConcentration) * Number(params.acidVolume)) / Number(params.baseConcentration)
      : 25;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchExperiment(id, locale)
      .then((b) => {
        if (!cancelled) setBundle(b);
      })
      .catch(() => undefined);
    fetchVirtualOps(id)
      .then((v) => {
        if (!cancelled) {
          setVops(v);
          setProgress({ completed: 0, total: 0, done: false });
        }
      })
      .catch(() => {
        if (!cancelled) setVops(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id, locale]);

  // 活塞打开时液滴累积：先快后慢（自适应滴速），接近等当点自动变细，便于停在浅粉色
  useEffect(() => {
    if (!bench.stopcock) return;
    const veNow = ve;
    const timer = setInterval(() => {
      setBench((b) => ({
        ...b,
        delivered: Math.min(
          60,
          b.delivered + Math.max(0.04, (veNow - b.delivered) * 0.03),
        ),
      }));
    }, 120);
    return () => clearInterval(timer);
  }, [bench.stopcock, ve]);

  const perform = useCallback(
    async (actionId: string, state?: Record<string, number | string | boolean>) => {
      if (!id) return;
      const nextLog = [...log, actionId];
      setLog(nextLog);
      try {
        const res: VirtualOpsCheckResult = await checkVirtualOps(id, {
          actions: nextLog,
          state,
          locale: locale === "en-US" ? "en-US" : "zh-CN",
        });
        setProgress({ completed: res.completedSteps, total: res.totalSteps, done: res.done });
        setFeedback({
          text: res.accepted ? t("vops.accepted") : t("vops.wrongOrder"),
          kind: res.accepted ? "ok" : "err",
        });
        if (res.checkpoint) {
          const key = res.checkpoint.feedbackKey as Parameters<typeof t>[0];
          setFeedback({
            text: res.done
              ? `${t(key)} ${t("vops.done")}`
              : t(key),
            kind: res.checkpoint.passed ? "ok" : "err",
          });
        } else if (res.done) {
          setFeedback({ text: t("vops.done"), kind: "ok" });
        }
      } catch (err) {
        setFeedback({
          text: err instanceof Error ? err.message : t("common.error"),
          kind: "err",
        });
      }
    },
    [id, log, locale, t],
  );

  const restart = () => {
    setLog([]);
    setFeedback(null);
    setProgress({ completed: 0, total: progress.total, done: false });
    setBench({ indicator: false, stopcock: false, delivered: 0, swirls: 0 });
    setMeasure("");
  };

  if (!bundle) return <EmptyState>{t("common.loading")}</EmptyState>;

  const isAcid = bundle.meta.id === "acid-base-titration";
  const isSlit = bundle.meta.id === "youngs-double-slit";
  const isCond = bundle.meta.id === "conductometric-titration";

  return (
    <div className={styles.page}>
      <div className={styles.headRow}>
        <Link to={`/experiment/${id}`} className={styles.progress}>
          {t("vops.back")}
        </Link>
        <h1>
          {t("vops.title")} · {bundle.content.title}
        </h1>
        <span className={styles.progress}>
          {tf("vops.progress", { done: progress.completed, total: progress.total })}
        </span>
        <button type="button" onClick={restart} className={styles.actionBtn}>
          {t("vops.restart")}
        </button>
      </div>

      {!vops ? (
        <EmptyState>{t("vops.notFound")}</EmptyState>
      ) : (
        <>
          <Card title={t("vops.scene")}>
            <div className={styles.sceneBox}>
              {isAcid ? (
                <AcidBenchScene
                  state={bench}
                  params={params}
                  onClickStopcock={() => {
                    const next = !bench.stopcock;
                    setBench((b) => ({ ...b, stopcock: next }));
                    void perform(next ? "open-stopcock" : "close-stopcock");
                  }}
                  onClickIndicator={() => {
                    if (!bench.indicator) {
                      setBench((b) => ({ ...b, indicator: true }));
                      void perform("add-indicator");
                    }
                  }}
                  onClickFlask={() => {
                    setBench((b) => ({ ...b, swirls: b.swirls + 1 }));
                    void perform("swirl");
                  }}
                />
              ) : isSlit ? (
                <SlitScene params={params} />
              ) : isCond ? (
                <ConductScene
                  params={params}
                  deliveredRatio={Math.min(1, log.filter((a) => a === "add-dropwise").length / 8)}
                />
              ) : (
                <EmptyState>{t("vops.notFound")}</EmptyState>
              )}
            </div>
          </Card>

          <Card title={t("vops.actions")}>
            <ActionBar
              actions={vops.availableActions}
              currentActionId={log[log.length - 1]}
              params={params}
              disabled={progress.done}
              onAction={(actionId) => {
                if (isAcid) {
                  if (actionId === "add-indicator") setBench((b) => ({ ...b, indicator: true }));
                  if (actionId === "open-stopcock") setBench((b) => ({ ...b, stopcock: true }));
                  if (actionId === "close-stopcock") setBench((b) => ({ ...b, stopcock: false }));
                  if (actionId === "swirl") setBench((b) => ({ ...b, swirls: b.swirls + 1 }));
                  void perform(actionId, {
                    deliveredMl: Number(bench.delivered.toFixed(2)),
                    endpointMl: Number(ve.toFixed(2)),
                  });
                } else if (isSlit) {
                  const dyExpected = (() => {
                    const lambda = Number(params.wavelength ?? 532);
                    const d = Number(params.slitSeparation ?? 0.2);
                    const dist = Number(params.screenDistance ?? 1);
                    return (lambda * dist) / (d * 1000);
                  })();
                  void perform(actionId, {
                    dyMeasured: Number(measure || 0),
                    dyExpected: Number(dyExpected.toFixed(2)),
                  });
                } else if (isCond) {
                  void perform(actionId, {
                    veRecorded: Number(measure || 0),
                    veExpected: Number(ve.toFixed(2)),
                  });
                } else {
                  void perform(actionId);
                }
              }}
              onParamChange={(paramId, value) => {
                // 参数调整即记录（input 类操作）；值写入仅用于场景展示
                if (bundle) {
                  useParamsStore.getState().setValue(bundle.meta.id, paramId, value);
                }
              }}
              measureField={
                isSlit
                  ? { paramKey: "dyMeasured", label: "Δy / mm" }
                  : isCond
                    ? { paramKey: "veRecorded", label: "V(A) / mL" }
                    : undefined
              }
              measureValue={measure}
              onMeasureChange={setMeasure}
            />
          </Card>

          {feedback ? <CheckpointFeedback text={feedback.text} kind={feedback.kind} /> : null}
        </>
      )}
    </div>
  );
}
