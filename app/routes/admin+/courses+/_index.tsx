import { PlusIcon } from "@heroicons/react/24/solid"
import { Badge, Button, Card, Text } from "@mantine/core"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"

export async function loader() {
  const courses = await prisma.course.findMany({})

  return json({ courses })
}

export default function ManageCourses() {
  const { courses } = useLoaderData<typeof loader>()

  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className=" px-4 py-10 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Manage Courses
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                A list of all the Courses.
              </p>
            </div>
            <Link to="/admin/courses/new">
              <div>
                <Button variant="filled" color="gray" loaderPosition="left">
                  <PlusIcon className="h-4 w-4" />
                  <span className="ml-2">Create</span>
                </Button>
              </div>
            </Link>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="text-gray-800 sm:grid sm:grid-cols-3 sm:gap-4">
                  {courses.map((course) => (
                    <Card shadow="sm" radius="md" withBorder key={course.id}>
                      <Text weight={500}>Name: {course.name} </Text>
                      <Text weight={500}>Code: {course.code} </Text>
                      <Text weight={500}>
                        Credit Hours: {course.credit_hours}{" "}
                      </Text>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-5">
                          <Link
                            prefetch="intent"
                            to={`/admin/courses/edit/${course.id}`}
                          >
                            <Badge mt="0.5rem" color="pink" variant="light">
                              <Button variant="subtle" loaderPosition="right">
                                Edit
                              </Button>
                            </Badge>
                          </Link>
                        </div>
                        <div className="flex gap-5">
                          <Link
                            prefetch="intent"
                            to={`/admin/courses/${course.id}`}
                          >
                            <Badge mt="0.5rem" color="pink" variant="light">
                              <Button variant="subtle" loaderPosition="right">
                                View
                              </Button>
                            </Badge>
                          </Link>
                        </div>
                      </div>
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
