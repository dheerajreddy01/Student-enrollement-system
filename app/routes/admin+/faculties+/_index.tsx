import { PlusIcon } from "@heroicons/react/24/solid"
import { ActionIcon, Badge, Button, Card, Text } from "@mantine/core"
import { json } from "@remix-run/node"
import { Form, Link, useLoaderData } from "@remix-run/react"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"

export async function loader() {
  const faculties = await prisma.faculty.findMany({
    include: {
     schedule: true,
    },
  })
  return json({ faculties })
}

export default function ManageFaculties() {
  const { faculties } = useLoaderData<typeof loader>()

  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className=" px-4 py-10 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Manage Faculty
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                A list of all the faculty in the system.
              </p>
            </div>
            <div>
              <Link to="/admin/faculties/new">
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
                  {faculties.map((faculty) => (
                    <Card shadow="sm" radius="md" withBorder key={faculty.id}>
                      <Text weight={500}>Name: {faculty.name} </Text>
                      <Text weight={500}>Email: {faculty.email} </Text>
                      {/* <Text weight={500}>
                        Department: {faculty.schedule.map((schedule) => schedule.)}
                      </Text> */}
                      <Link to={`/admin/faculties/edit/${faculty.id}`}>
                        <Badge mt="0.5rem" color="pink" variant="light">
                          <Button variant="subtle" loaderPosition="right">
                            Edit
                          </Button>
                        </Badge>
                      </Link>
                      <Form method="post" action="/resources/delete-faculty">
                        <ActionIcon
                          type="submit"
                          name="facultyId"
                          value={faculty.id}
                        >
                          Delete
                        </ActionIcon>
                      </Form>
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
