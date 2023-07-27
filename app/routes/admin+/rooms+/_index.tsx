import { PlusIcon } from "@heroicons/react/24/solid"
import { ActionIcon, Badge, Button } from "@mantine/core"
import { json } from "@remix-run/node"
import { Form, Link, useLoaderData } from "@remix-run/react"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"

export async function loader() {
  const rooms = await prisma.room.findMany({})
  return json({ rooms })
}

export default function AdminSections() {
  const { rooms } = useLoaderData<typeof loader>()
  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className=" px-4 py-10 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Manage Rooms
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                A list of all the Rooms.
              </p>
            </div>
            <div>
              <Link to="/admin/rooms/new">
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
                <div className="overflow-hidden border-b border-gray-400 shadow sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-400">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-lg font-medium tracking-wider text-gray-700"
                        >
                          Room Number
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-lg font-medium tracking-wider text-gray-700"
                        >
                          Max Capacity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {rooms.map((room) => (
                        <tr key={room.id}>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {room.no}
                            </div>
                          </td>
                          <td className="flex items-center justify-between whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {room.maxCapacity}
                            </div>
                            <div>
                              <Link to={`/admin/rooms/edit/${room.id}`}>
                                <Badge mt="0.5rem" color="pink" variant="light">
                                  <Button
                                    variant="subtle"
                                    loaderPosition="right"
                                  >
                                    Edit
                                  </Button>
                                </Badge>
                              </Link>
                            </div>
                            <Form method="post" action="/resources/delete-room">
                              <ActionIcon
                                type="submit"
                                name="roomId"
                                value={room.id}
                              >
                                Delete
                              </ActionIcon>
                            </Form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TailwindContainer>
    </>
  )
}
