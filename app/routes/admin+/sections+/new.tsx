import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid"
import { Button, Select, TextInput } from "@mantine/core"
import { TimeInput } from "@mantine/dates"
import type { ActionFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import * as React from "react"
import { badRequest } from "remix-utils"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"
import PageHeading from "~/components/page-heading"
import { TailwindContainer } from "~/components/tailwind-container"
import { Day } from "~/days"
import { prisma } from "~/lib/db.server"
import { formatTime, toFixedDate } from "~/utils"
import { useValidateServerTimeslot } from "~/utils/hooks/validate-server-timeslot"
import type { MandatoryFields } from "~/utils/misc"
import { convertToDateTime } from "~/utils/misc"
import type { inferErrors } from "~/utils/validation"
import { validateAction } from "~/utils/validation"

const createSectionSchema = z.object({
  name: z.string().nonempty("Name is required"),
  code: z.string().nonempty("Code is required"),
  courseId: z.string().nonempty("Course ID is required"),
  roomId: z.string().nonempty("Room ID is required"),
  facultyId: z.string().nonempty("Faculty ID is required"),
  schedules: z
    .string()
    .transform((value) => JSON.parse(value))
    .pipe(
      z.array(
        z.object({
          day: z.string(),
          startTime: z.string(),
          endTime: z.string(),
        }),
      ),
    ),
})

export async function loader() {
  const sections = await prisma.section.findMany({})
  const courses = await prisma.course.findMany({})
  const faculties = await prisma.faculty.findMany({})
  const rooms = await prisma.room.findMany({})
  return json({ sections, courses, faculties, rooms })
}

interface ActionData {
  success: boolean
  fieldErrors?: inferErrors<typeof createSectionSchema>
}

type ISchedule = {
  id: string
  day: Day | null
  startTime?: string
  endTime?: string
}

export const action: ActionFunction = async ({ request }) => {
  const { fields, fieldErrors } = await validateAction(
    request,
    createSectionSchema,
  )

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors })
  }

  const { code, name, courseId, roomId, facultyId, schedules } = fields

  const existingSection = await prisma.section.findFirst({
    where: {
      code: code,
    },
  })

  if (existingSection) {
    return badRequest<ActionData>({
      success: false,
      fieldErrors: {
        code: "Section with this code already exists",
      },
    })
  }

  await prisma.section.create({
    data: {
      code: code,
      name: name,
      courseId: courseId,
      roomId: roomId,
      facultyId: facultyId,
      schedules: {
        createMany: {
          data: schedules.map((schedule) => ({
            day: schedule.day as Day,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            facultyId: facultyId,
          })),
        },
      },
    },
  })

  return redirect("/admin/sections")
}

export default function CreateNewSection() {
  const { courses, faculties, rooms } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<ActionData>()

  const { validateTimeSlot, validateLocalTimeSlotConflict } =
    useValidateServerTimeslot()

  const [day, setDay] = React.useState<Day | null>(null)
  const [startTime, setStartTime] = React.useState<string>("")
  const [endTime, setEndTime] = React.useState<string>("")
  const [facultyId, setFacultyId] = React.useState<string | null>("")
  const [roomId, setRoomId] = React.useState<string | null>("")

  const [schedules, setSchedules] = React.useState<
    MandatoryFields<ISchedule>[]
  >([])

  const isSubmitting = fetcher.state !== "idle"

  const handleAddTimeSlot = () => {
    if (!day || !startTime || !endTime || !facultyId || !roomId) return

    const localTimeslotCheck = validateLocalTimeSlotConflict(
      {
        day,
        startTime,
        endTime,
      },
      schedules,
    )

    if (!localTimeslotCheck.success)
      return toast.error(localTimeslotCheck.error)

    const data = validateTimeSlot({
      day,
      startTime,
      endTime,
      facultyId,
      roomId,
    })

    if (!data.success) {
      return toast.error(data.error)
    }

    setSchedules((prev) => [
      ...prev,
      {
        id: uuidv4(),
        day,
        endTime: toFixedDate(convertToDateTime(endTime)).toISOString(),
        startTime: toFixedDate(convertToDateTime(startTime)).toISOString(),
      },
    ])

    setDay(null)
    setStartTime("")
    setEndTime("")
  }

  const handleRemoveTimeSlot = (id: string) => {
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== id))
  }

  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className=" px-4 py-10 sm:px-6 lg:px-8">
          <PageHeading
            title="Create sections"
            subtitle="Create the section"
            showBackButton
            to="/admin/sections"
            rightSection={
              <Button
                type="submit"
                form="form"
                variant="filled"
                color="gray"
                loading={isSubmitting}
                loaderPosition="left"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="ml-2">Create</span>
              </Button>
            }
          />
        </div>
      </TailwindContainer>
      <div className="p-8 grid grid-cols-2 gap-12">
        <fetcher.Form replace id="form" method="post">
          <fieldset
            disabled={isSubmitting}
            className="mt-2 flex flex-col gap-4"
          >
            <input
              hidden
              name="schedules"
              value={JSON.stringify(schedules)}
              onChange={() => {}}
            />
            <TextInput
              name="code"
              label="Section Code"
              error={fetcher.data?.fieldErrors?.code}
              required
            />

            <TextInput
              name="name"
              label="Section Name"
              error={fetcher.data?.fieldErrors?.name}
              required
            />

            <Select
              name="courseId"
              label="Course"
              error={fetcher.data?.fieldErrors?.courseId}
              data={courses.map((course) => ({
                value: course.id,
                label: course.name,
              }))}
              required
            />

            <Select
              name="facultyId"
              label="Faculty"
              error={fetcher.data?.fieldErrors?.facultyId}
              onChange={(value) => setFacultyId(value as string)}
              data={faculties.map((faculty) => ({
                value: faculty.id,
                label: faculty.name,
              }))}
              required
            />

            <Select
              name="roomId"
              label="Room"
              error={fetcher.data?.fieldErrors?.roomId}
              onChange={(value) => setRoomId(value as string)}
              data={rooms.map((room) => ({
                value: room.id,
                label: room.no,
              }))}
              required
            />
          </fieldset>
        </fetcher.Form>

        <div className="flex flex-col gap-4">
          {schedules.length > 0 ? (
            <ol className="flex flex-col gap-2 pb-4 border-b">
              {schedules.map((schedule) => (
                <li
                  key={schedule.id}
                  className="text-sm space-x-2 flex items-center justify-between border-b rounded-md p-2 bg-slate-300 "
                >
                  <span>{schedule.day}</span>
                  <span>
                    ({formatTime(schedule.startTime)} -{" "}
                    {formatTime(schedule.endTime)})
                  </span>
                  <Button
                    variant="filled"
                    color="red"
                    onClick={() => handleRemoveTimeSlot(schedule.id)}
                    className="h-4 w-4"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ol>
          ) : null}
          <Select
            name="day"
            label="Day"
            onChange={(value) => setDay(value as Day)}
            value={day}
            data={Object.values(Day).map((day) => ({
              value: day,
              label: day,
            }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <TimeInput
              name="startTime"
              label="Start Time"
              value={startTime}
              onChange={(e) => setStartTime(e.currentTarget.value)}
            />

            <TimeInput
              name="endTime"
              label="End Time"
              onChange={(e) => setEndTime(e.currentTarget.value)}
              value={endTime}
            />
          </div>

          <Button
            onClick={handleAddTimeSlot}
            disabled={!day || !startTime || !endTime || !facultyId || !roomId}
          >
            Add Schedule
          </Button>
        </div>
      </div>
    </>
  )
}
