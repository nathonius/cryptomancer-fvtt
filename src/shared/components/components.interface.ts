export interface AttributeBarContext {
  color: "primary" | "secondary" | "success" | "danger";
  value: number;
  valueName: string;
  valuePlaceholder: string;
  valueReadonly?: boolean;
  max: number;
  maxName: string;
  maxPlaceholder: string;
  class: string;
  tooltip: string;
  maxReadonly?: boolean;
}
