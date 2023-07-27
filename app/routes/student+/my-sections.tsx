import { Card } from "@mantine/core"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { badRequest } from "remix-utils"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"
import { requireUserId } from "~/session.server"

export async function loader({ request }: LoaderArgs) {
  const studentId = await requireUserId(request)
  const studentSections = await prisma.enrollment.findMany({
    where: {
      studentId,
    },
    include: {
     
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

  // await prisma.enrollment.delete({
  //   where: {
  //     studentId_sectionId: {
  //       sectionId,
  //       studentId,
  //     },
  //   },
  // })

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
          <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                View Your Sections
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Click on the section to view course materials.
              </p>
            </div>
          </div>
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
                        {/* <Link
                          to={`/student/my-sections/${studentSection.sectionId}/documents`}
                        >
                          <Text size="lg" weight={500}>
                            Name: {studentSection.section.name}
                          </Text>
                          <Text size="sm" weight={500}>
                            Code: {studentSection.section.code}
                          </Text>
                          <Text size="sm" weight={500}>
                            Faculty: {studentSection.section.faculty.name}
                          </Text>
                          <Text size="sm" weight={500}>
                            Timings:
                            {studentSection.section.timeSlots.map(
                              (timeSlot) => (
                                <div key={timeSlot.id}>
                                  {timeSlot.day}:{" "}
                                  {formatTime(timeSlot.startTime)} -{" "}
                                  {formatTime(timeSlot.endTime)}
                                </div>
                              ),
                            )}
                          </Text>
                        </Link> */}
                        {/* <div className="flex items-center justify-center mt-2">
                          <ActionIcon
                            color="red"
                            disabled={isSubmitting}
                            onClick={() =>
                              fetcher.submit(
                                {
                                  sectionId: studentSection.sectionId,
                                },
                                {
                                  method: "post",
                                  replace: true,
                                },
                              )
                            }
                          >
                            Drop
                          </ActionIcon>
                        </div> */}
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
