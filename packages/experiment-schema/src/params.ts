export type ParameterDef =
  | {
      kind: "slider";
      id: string;
      label: string;
      min: number;
      max: number;
      step: number;
      unit: string;
      defaultValue: number;
    }
  | {
      kind: "select";
      id: string;
      label: string;
      options: { value: string; label: string }[];
      defaultValue: string;
    }
  | {
      kind: "toggle";
      id: string;
      label: string;
      defaultValue: boolean;
    };

export type ParamValue = number | string | boolean;
export type ParamValues = Record<string, ParamValue>;

export interface NormalRange {
  parameterId: string;
  min: number;
  max: number;
  /** 如"终点过冲体积" */
  label: string;
  /** 如"教学简化范围，非标准规范" */
  note: string;
}
