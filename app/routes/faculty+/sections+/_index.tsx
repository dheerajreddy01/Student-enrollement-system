import { Card, Text } from "@mantine/core"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"
import { requireUserId } from "~/session.server"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loader({ request }: LoaderArgs) {
  const facultyId = await requireUserId(request)
  //get those sections which are taught by this faculty
  const sections = await prisma.section.findMany({
    where: {
      facultyId: facultyId,
    },
    include: {
      course: true,
      room: true,
    },
  })

  return json({ sections })
}

export default function FacultyCourses() {
  const { sections } = useLoaderData<typeof loader>()

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
                Click on the section to add files to it.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="text-gray-800 sm:grid sm:grid-cols-3 sm:gap-4">
                  {sections.map((section) => (
                    <Link
                      to={`/faculty/sections/${section.id}`}
                      key={section.id}
                    >
                      <Card shadow="sm" radius="md" withBorder>
                        <Text weight={500}>Name: {section.name} </Text>
                        <Text weight={500}>Code: {section.code} </Text>
                        <Text weight={500}>Course: {section.course.name} </Text>
                        <Text weight={500}>Room: {section.room.no} </Text>
                        {/* <Text weight={500}>
                          Time Slots:
                          {section.timeSlots.map((timeSlot) => (
                            <div key={timeSlot.id}>
                              {timeSlot.day}: {formatTime(timeSlot.startTime)} -{" "}
                              {formatTime(timeSlot.endTime)}
                            </div>
                          ))}
                        </Text> */}
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
