export type TraceValue =
  | { kind: 'text'; value: string }
  | { kind: 'symbols'; value: string[] }
  | { kind: 'numbers'; value: Array<number | string> }
  | { kind: 'bits'; value: string; groups?: number[] }
  | { kind: 'matrix'; value: Array<Array<string | number>>; rowLabels?: string[]; colLabels?: string[] }
  | { kind: 'mapping'; value: Array<{ from: string; to: string }> };

export interface TraceStep {
  id: string;
  phase: string;
  title: string;
  explanation: string;
  formula?: string;
  substitutions?: string[];
  before?: TraceValue;
  after?: TraceValue;
  highlights?: Array<{ target: string; role: 'read' | 'write' | 'key' | 'changed' | 'warning' }>;
  metadata?: Record<string, string | number | boolean>;
}

export interface EngineResult<O> {
  output: O;
  normalizedInput: unknown;
  trace: TraceStep[];
  warnings: string[];
  metrics?: Record<string, number | string>;
}

export interface ValidationIssue { path: string; message: string }
export interface CryptoEngine<I, O, P> {
  id: string;
  validate(input: I, params: P): ValidationIssue[];
  run(input: I, params: P): EngineResult<O>;
}

export const step = (id: string, title: string, explanation: string, before: string, after: string, formula?: string): TraceStep => ({
  id, phase: 'cálculo', title, explanation, before: {kind: 'text', value: before}, after: {kind: 'text', value: after}, ...(formula ? {formula} : {})
});
