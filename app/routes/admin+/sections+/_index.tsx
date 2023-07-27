import { PlusIcon } from "@heroicons/react/24/solid"
import { Badge, Button, Card, Text } from "@mantine/core"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import * as React from "react"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"
import { formatTime } from "~/utils"

export async function loader() {
  const sections = await prisma.section.findMany({
    include: {
      course: true,
      room: true,
      faculty: true,
      schedules: true,
    },
  })
  return json({ sections })
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
                Manage Sections
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage the sections that are available to students.
              </p>
            </div>
            <div>
              <Link to="/admin/sections/new">
                <Button variant="filled" color="gray" loaderPosition="left">
                  <PlusIcon className="h-4 w-4" />
                  <span className="ml-2">Create</span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="text-gray-800 sm:grid sm:grid-cols-3 sm:gap-4">
                  {sections.length > 0 ? (
                    sections.map((section) => (
                      <Card shadow="sm" radius="md" withBorder key={section.id}>
                        <Text weight={500}>Code: {section.code} </Text>
                        <Text weight={500}>Name: {section.name} </Text>
                        <Text weight={500}>Course: {section.course.name} </Text>
                        <Text weight={500}>Room: {section.room.no} </Text>
                        <Text weight={500}>
                          Faculty: {section.faculty.name}{" "}
                        </Text>
                        <Text weight={500}>
                          Schedules:
                          {section.schedules.length > 0 ? (
                            section.schedules.map((schedule) => (
                              <React.Fragment key={schedule.id}>
                                <p className="font-bold">{schedule.day}</p>
                                <p>
                                  {formatTime(schedule.startTime!)}
                                  {" - "}
                                  {formatTime(schedule.endTime!)}
                                </p>
                              </React.Fragment>
                            ))
                          ) : (
                            <p>No time slots</p>
                          )}
                        </Text>
                        <Link to={`/admin/sections/edit/${section.id}`}>
                          <Badge mt="0.5rem" color="pink" variant="light">
                            <Button variant="subtle" loaderPosition="right">
                              Edit
                            </Button>
                          </Badge>
                        </Link>
                      </Card>
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
