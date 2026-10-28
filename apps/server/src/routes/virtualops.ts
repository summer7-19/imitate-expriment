import type { FastifyInstance } from "fastify";
import type { VirtualOperationPublic } from "@physchem/experiment-schema";
import { loadVirtualOp } from "../db/client";
import { evaluateVirtualOps } from "../data/virtualops-evaluate";

export function registerVirtualOpsRoutes(app: FastifyInstance): void {
  /** 公开投影：只有可用操作清单，绝不含 requiredSequence / checkpoints */
  app.get<{ Params: { experimentId: string } }>(
    "/api/virtual-ops/:experimentId",
    async (req, reply) => {
      const def = loadVirtualOp(req.params.experimentId);
      if (!def) return reply.code(404).send({ error: "该实验暂未开放虚拟操作" });
      const pub: VirtualOperationPublic = {
        id: def.id,
        experimentId: def.experimentId,
        availableActions: def.availableActions,
      };
      return pub;
    },
  );

  /** 序列判定：服务端无状态校验，正确答案永不出现在响应中 */
  app.post<{ Params: { experimentId: string }; Body: { actions?: string[]; state?: Record<string, number | string | boolean>; locale?: string } }>(
    "/api/virtual-ops/:experimentId/check",
    async (req, reply) => {
      const def = loadVirtualOp(req.params.experimentId);
      if (!def) return reply.code(404).send({ error: "该实验暂未开放虚拟操作" });
      const actions = Array.isArray(req.body?.actions) ? req.body.actions.slice(0, 100) : [];
      const result = evaluateVirtualOps(def, actions, req.body?.state);
      return result;
    },
  );
}
