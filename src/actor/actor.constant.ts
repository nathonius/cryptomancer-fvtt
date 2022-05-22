import { CellTimeIncrement } from "./actor.enum";
import { Cell } from "./actor.interface";

export const DEFAULT_CELL: Cell = {
  mission: "",
  operations: 4,
  skillBreak: false,
  skillPush: false,
  time: {
    increment: CellTimeIncrement.Downtime,
    value: 0,
  },
  type: "",
};
