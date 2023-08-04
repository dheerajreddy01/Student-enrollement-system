import { Card, Text } from "@mantine/core"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { TailwindContainer } from "~/components/tailwind-container"
import { Day } from "~/days"
import { prisma } from "~/lib/db.server"
import { requireUserId } from "~/session.server"
import { formatTime } from "~/utils"

export async function loader({ request }: LoaderArgs) {
  const facultyId = await requireUserId(request)
  const facultySections = await prisma.section.findMany({
    where: {
      schedules: {
        some: {
          facultyId,
        },
      },
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

  console.log(JSON.stringify(facultySections, null, 2))

  return json({ facultySections })
}

export default function FacultySections() {
  const { facultySections } = useLoaderData<typeof loader>()

  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className=" px-4 py-10 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                View Sections
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                View all the sections taught by you.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="text-gray-800 sm:grid sm:grid-cols-3 sm:gap-4">
                  {facultySections.map((facultySection) => (
                    <Link
                      to={`/faculty/sections/${facultySection.id}`}
                      key={facultySection.id}
                    >
                      <Card
                        shadow="sm"
                        radius="md"
                        withBorder
                        key={facultySection.id}
                      >
                        <Text weight={500}>Name: {facultySection.name}</Text>
                        <Text weight={500}>
                          Course: {facultySection.course.name}
                        </Text>
                        <Text weight={500}>
                          Course: {facultySection.room.no}
                        </Text>
                        <Text weight={500}>
                          Enrolled: {facultySection.enrollments.length}
                        </Text>
                        <Text weight={500}>
                          Schedule:{" "}
                          {facultySection.schedules
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
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </TailwindContainer>
    </>
  )
}
