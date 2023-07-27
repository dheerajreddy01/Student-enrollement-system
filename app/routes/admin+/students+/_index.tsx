import { Card, Text } from "@mantine/core"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"

export async function loader() {
  const students = await prisma.student.findMany({})

  return json({ students })
}

export default function AdminFacultyPage() {
  const { students } = useLoaderData<typeof loader>()

  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className=" px-4 py-10 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Manage Students
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                A list of all the Students.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="text-gray-800 sm:grid sm:grid-cols-3 sm:gap-4">
                  {students.map((student) => (
                    <Card shadow="sm" radius="md" withBorder key={student.id}>
                      <Text weight={500}>Name: {student.name} </Text>
                      <Text weight={500}>Email: {student.email} </Text>
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
