import { create } from "zustand";
import type { ParamValues, RenderJobRecord } from "@physchem/experiment-schema";
import type { Locale } from "@physchem/experiment-schema";
import { createRenderJob, deleteRenderJob, listRenderJobs } from "../lib/api";

interface JobsState {
  jobs: RenderJobRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  submit: (experimentId: string, locale: Locale, params: ParamValues) => Promise<string>;
  submitMany: (items: { experimentId: string; locale: Locale }[]) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  loading: false,
  error: null,
  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const jobs = await listRenderJobs();
      set({ jobs, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : "offline" });
    }
  },
  submit: async (experimentId, locale, params) => {
    const job = await createRenderJob(experimentId, locale, params);
    await get().refresh();
    return job.id;
  },
  submitMany: async (items) => {
    for (const item of items) {
      await createRenderJob(item.experimentId, item.locale, {});
    }
    await get().refresh();
  },
  remove: async (id) => {
    await deleteRenderJob(id);
    await get().refresh();
  },
}));
