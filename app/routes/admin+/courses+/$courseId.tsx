import { Card, Text } from "@mantine/core"
import type { LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import PageHeading from "~/components/page-heading"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"

export async function loader({ params }: LoaderArgs) {
  const { courseId } = params

  if (!courseId) return redirect("/admin/courses")

  const sections = await prisma.section.findMany({
    where: {
      courseId,
    },
    include: {
      faculty: true,
      room: true,
    },
  })

  return json({ sections })
}

export default function ManageCourses() {
  const { sections } = useLoaderData<typeof loader>()
  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className=" px-4 py-10 sm:px-6 lg:px-8">
          <PageHeading
            title="View sections"
            subtitle="A list of all the sections."
            showBackButton
            to="/admin/courses"
          />

          <div className="mt-8 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                {sections.length === 0 ? (
                  <Text>No sections associated with this course</Text>
                ) : (
                  <div className="text-gray-800 sm:grid sm:grid-cols-3 sm:gap-4">
                    {sections.map((section) => (
                      <Card shadow="sm" radius="md" withBorder key={section.id}>
                        <Text weight={500}>Name: {section.name} </Text>
                        <Text weight={500}>Code: {section.code} </Text>
                        <Text weight={500}>
                          {" "}
                          Faculty: {section.faculty.name}{" "}
                        </Text>
                        <Text weight={500}> Room: {section.room.no} </Text>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </TailwindContainer>
    </>
  )
}
