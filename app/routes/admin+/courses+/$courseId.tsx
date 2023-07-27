import { PlusIcon } from "@heroicons/react/24/solid"
import { Button, Card, Text } from "@mantine/core"
import type { LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Link, useLoaderData, useParams } from "@remix-run/react"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"

export async function loader({ params }: LoaderArgs) {
  const { courseId } = params

  if (!courseId) return redirect("/admin/courses")

  const sections = await prisma.section.findMany({
    where: {
      id: courseId,
    },
    include: {
      faculty: true,
      room: true,
    },
  })

  return json({ sections })
}

export default function ManageCourses() {
  const params = useParams() as { courseId: string }
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
                A list of all the sections.
              </p>
            </div>
            <Link
              prefetch="intent"
              to={`/admin/courses/edit/${params.courseId}`}
            >
              <div>
                <Button variant="filled" color="gray" loaderPosition="left">
                  <PlusIcon className="h-4 w-4" />
                  <span className="ml-2">Edit</span>
                </Button>
              </div>
            </Link>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
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
              </div>
            </div>
          </div>
        </div>
      </TailwindContainer>
    </>
  )
}
