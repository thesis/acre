export type ModalProps = Record<string, unknown>

export type BaseModalProps = {
  closeModal: () => void
}

export const MODAL_TYPES = {
  STAKE: "STAKE",
  UNSTAKE: "UNSTAKE",
  WELCOME: "WELCOME",
  MEZO_BEEHIVE: "MEZO_BEEHIVE",
} as const

export type ModalType = (typeof MODAL_TYPES)[keyof typeof MODAL_TYPES]
