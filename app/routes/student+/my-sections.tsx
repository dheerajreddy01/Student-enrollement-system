import { Button, Card, Text } from "@mantine/core"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { badRequest } from "remix-utils"
import PageHeading from "~/components/page-heading"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"
import { requireUserId } from "~/session.server"
import { formatTime } from "~/utils"

export async function loader({ request }: LoaderArgs) {
  const studentId = await requireUserId(request)
  const studentSections = await prisma.section.findMany({
    where: {
      enrollments: {
        some: {
          studentId,
        },
      },
    },
    include: {
      course: true,
      faculty: true,
      room: true,
      schedules: true,
    },
  })
  return json({ studentSections })
}

export async function action({ request }: LoaderArgs) {
  const formData = await request.formData()
  const studentId = await requireUserId(request)

  const sectionId = formData.get("sectionId")?.toString()
  if (!sectionId) {
    return badRequest({
      message: "Missing required fields: sectionId",
    })
  }

  console.log({ sectionId, studentId })

  await prisma.enrollment.delete({
    where: {
      studentId_sectionId: {
        sectionId,
        studentId,
      },
    },
  })

  return json({ success: true })
}

export default function ManageSections() {
  const { studentSections } = useLoaderData<typeof loader>()

  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== "idle"
  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className=" px-4 py-10 sm:px-6 lg:px-8">
          <PageHeading
            title="View sections"
            subtitle="A list of all the sections that you are enrolled in."
          />
          <div className="mt-8 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="text-gray-800 sm:grid sm:grid-cols-3 sm:gap-4">
                  {studentSections.length > 0 ? (
                    studentSections.map((studentSection) => (
                      <Card
                        shadow="sm"
                        radius="md"
                        withBorder
                        key={studentSection.id}
                      >
                        <Text size="lg" weight={500}>
                          Name: {studentSection.name}
                        </Text>
                        <Text size="sm" weight={500}>
                          Code: {studentSection.code}
                        </Text>
                        <Text size="sm" weight={500}>
                          Faculty: {studentSection.faculty.name}
                        </Text>
                        <Text size="sm" weight={500}>
                          Timings:
                          {studentSection.schedules.map((schedule) => (
                            <div key={schedule.id}>
                              {schedule.day}: {formatTime(schedule.startTime)} -{" "}
                              {formatTime(schedule.endTime)}
                            </div>
                          ))}
                        </Text>
                        <div className="flex items-center justify-center mt-2">
                          <Button
                            compact
                            variant="subtle"
                            color="red"
                            loading={isSubmitting}
                            onClick={() =>
                              fetcher.submit(
                                {
                                  sectionId: studentSection.id,
                                },
                                {
                                  method: "post",
                                  replace: true,
                                },
                              )
                            }
                          >
                            Drop
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <>
                      <p>You are not enrolled in any sections.</p>
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
