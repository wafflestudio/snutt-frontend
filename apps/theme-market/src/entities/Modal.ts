export type ModalStatus =
  | {
      isOpen: true;
      type: "ALERT" | "CONFIRM";
      description: string;
      onCancel?: () => void;
      onConfirm?: () => void;
    }
  | {
      isOpen: false;
    };
