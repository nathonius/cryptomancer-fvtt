export interface AttributeBarContext {
  color: "primary" | "secondary" | "success" | "danger";
  value: number;
  valueName: string;
  valuePlaceholder: string;
  max: number;
  maxName: string;
  maxPlaceholder: string;
  class: string;
  tooltip: string;
}
