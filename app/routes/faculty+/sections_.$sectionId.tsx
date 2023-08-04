import { Text } from "@mantine/core"
import type { LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import PageHeading from "~/components/page-heading"
import { TailwindContainer } from "~/components/tailwind-container"
import { Day } from "~/days"
import { prisma } from "~/lib/db.server"
import { formatTime } from "~/utils"

export async function loader({ params }: LoaderArgs) {
  const { sectionId } = params
  const section = await prisma.section.findFirst({
    where: {
      id: sectionId,
    },
    include: {
      course: true,
      room: true,
      schedules: true,
      enrollments: {
        include: {
          student: true,
        },
      },
    },
  })

  if (!section) {
    return redirect("/faculty/sections")
  }

  return json({ section })
}

export default function FacultySections() {
  const { section } = useLoaderData<typeof loader>()

  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className=" px-4 py-10 sm:px-6 lg:px-8">
          <PageHeading
            title={section.name}
            subtitle="view the details"
            showBackButton
            to="/faculty/sections"
          />
          <div className="mt-8 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="text-gray-800 sm:grid">
                  <div className="flex flex-col gap-4">
                    <Text weight={500}>
                      <span className="font-bold">Name</span>: {section.name}
                    </Text>
                    <Text weight={500}>
                      <span className="font-bold">Course</span>:{" "}
                      {section.course.name}
                    </Text>
                    <Text weight={500}>
                      <span className="font-bold">Room</span>: {section.room.no}
                    </Text>
                    <Text weight={500}>
                      <span className="font-bold">Enrolled</span>:{" "}
                      {section.enrollments.map((enrollment) => (
                        <ul key={enrollment.student.id}>
                          <li className="flex flex-col gap-2">
                            <p>
                              {enrollment.student.name}
                              <br />
                              {enrollment.student.email} (
                              {enrollment.student.phone_no})
                            </p>
                          </li>
                        </ul>
                      ))}
                    </Text>
                    <Text weight={500}>
                      <span className="font-bold">Schedule</span>:{" "}
                      {section.schedules
                        .sort((a, b) => {
                          const days = Object.values(Day)

                          return days
                            .indexOf(a.day as Day)
                            .toString()
                            .localeCompare(
                              days.indexOf(b.day as Day).toString(),
                            )
                        })
                        .map((schedule) => (
                          <div
                            key={schedule.id}
                            className="flex items-center justify-between"
                          >
                            <p>{schedule.day}</p>
                            <p>
                              {formatTime(schedule.startTime)}-
                              {formatTime(schedule.endTime)}{" "}
                            </p>
                          </div>
                        ))}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TailwindContainer>
    </>
  )
}
