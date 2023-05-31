import { Node } from "@mono/types";
import { idGenerator } from "@mono/utility";

export const generateNode = (label: string, status: string): Node => {
  return {
    id: idGenerator(),
    label,
    status,
  };
};
