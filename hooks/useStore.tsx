import { create } from "zustand"

type State = {
  fetchingFromContract: boolean
  canCreateSchedules: boolean
  hasSchedule: boolean
}

type Actions = {
  setFetching: (fetching: boolean) => void
  setCanCreateSchedules: (canCreateSchedules: boolean) => void
  setHasSchedule: (hasSchedule: boolean) => void
}

export const useStore = create<State & Actions>((set) => ({
  fetchingFromContract: false,
  canCreateSchedules: false,
  hasSchedule: false,
  setFetching: (fetching: boolean) =>
    set(() => ({ fetchingFromContract: fetching })),
  setCanCreateSchedules: (canCreateSchedules: boolean) =>
    set(() => ({ canCreateSchedules: canCreateSchedules })),
  setHasSchedule: (hasSchedule: boolean) =>
    set(() => ({ hasSchedule: hasSchedule })),
}))
