import { ActionIcon, Card, Text } from "@mantine/core"
import type { ActionArgs, SerializeFrom } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { badRequest } from "remix-utils"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"
import { requireUserId } from "~/session.server"
import { useStudent } from "~/utils/hooks"

export async function loader() {
  const sections = await prisma.section.findMany({
    include: {
      course: true,
      room: true,
      faculty: true,
    },
  })
  return json({ sections })
}
export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const studentId = await requireUserId(request)

  const sectionId = formData.get("sectionId")?.toString()

  if (!sectionId) {
    return badRequest("Missing required fields: sectionId")
  }

  // await prisma.enrollment.create({
  //   data: {
  //     section: {
  //       connect: {
  //         id: sectionId,
  //       },
  //     },
  //     student: {
  //       connect: {
  //         id: studentId,
  //       },
  //     },
  //   },
  // })

  return redirect("/student/my-sections")
}

export default function ManageSections() {
  const { sections } = useLoaderData<typeof loader>()

  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className=" px-4 py-10 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                View All Sections
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Enroll into any section which matches your schedule.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="text-gray-800 sm:grid sm:grid-cols-3 sm:gap-4">
                  {sections.length > 0 ? (
                    sections.map((section) => (
                      <SectionRow section={section} key={section.id} />
                    ))
                  ) : (
                    <>
                      <p>No sections to Display.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </TailwindContainer>
    </>
  )
}

function SectionRow({
  section,
}: {
  section: SerializeFrom<typeof loader>["sections"][0]
}) {
  const student = useStudent()
  const fetcher = useFetcher()

  const isSubmitting = fetcher.state !== "idle"
  // const isEnrolled = section.students.some((s) => s.studentId === student.id)
  return (
    <Card shadow="sm" radius="md" withBorder key={section.id}>
      <Text weight={500}>Code: {section.code} </Text>
      <Text weight={500}>Name: {section.name} </Text>
      <Text weight={500}>Course: {section.course.name} </Text>
      <Text weight={500}>Room: {section.room.no} </Text>
      <Text weight={500}>Faculty: {section.faculty.name} </Text>
      {/* <Text weight={500}>
        Time Slots:
        {section.timeSlots.length > 0 ? (
          section.timeSlots.map((timeSlot) => (
            <React.Fragment key={timeSlot.id}>
              <p className="font-bold">{timeSlot.day}</p>
              <p>
                {formatTime(timeSlot.startTime!)}
                {" - "}
                {formatTime(timeSlot.endTime!)}
              </p>
            </React.Fragment>
          ))
        ) : (
          <p>No time slots</p>
        )}
      </Text> */}
      <div className="flex items-center justify-center mt-2">
        <ActionIcon
          color="teal"
          loading={isSubmitting}
          // disabled={isEnrolled}
          onClick={() =>
            fetcher.submit(
              {
                sectionId: section.id,
              },
              {
                method: "post",
                replace: true,
              },
            )
          }
        >
          {/* {isEnrolled ? "Enrolled" : "Enroll"} */}
        </ActionIcon>
      </div>
    </Card>
  )
}
