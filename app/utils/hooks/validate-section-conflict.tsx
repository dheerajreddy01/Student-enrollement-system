import { type Day } from "~/days"
import { toFixedDate } from "~/utils"
import { convertToDateTime } from "~/utils/misc"

type ValidationReturnType =
  | {
      success: false
      error: string
    }
  | {
      success: true
    }

type IS = {
  day: Day | string
  startTime: string
  endTime: string
  roomId: string
}

export function useValidateSectionConflict() {
  const validateLocalSectionConflict = <
    T extends Pick<IS, "day" | "startTime" | "endTime">,
  >(
    section: Pick<IS, "day" | "startTime" | "endTime">,
    sections: Array<T>,
  ): ValidationReturnType => {
    const isConflict = sections.some((slot) => {
      if (slot.day !== section.day) return false

      const startTime = toFixedDate(convertToDateTime(section.startTime!))
      const endTime = toFixedDate(convertToDateTime(section.endTime!))

      const slotStartTime = new Date(slot.startTime)
      const slotEndTime = new Date(slot.endTime)

      if (
        startTime.getTime() >= slotStartTime.getTime() &&
        startTime.getTime() < slotEndTime.getTime()
      )
        return true

      if (
        endTime.getTime() > slotStartTime.getTime() &&
        endTime.getTime() <= slotEndTime.getTime()
      )
        return true

      return false
    })

    if (isConflict) {
      return {
        success: false,
        error: "Section conflicts with another section",
      }
    }

    return {
      success: true,
    }
  }

  return {
    validateLocalSectionConflict,
  }
}
