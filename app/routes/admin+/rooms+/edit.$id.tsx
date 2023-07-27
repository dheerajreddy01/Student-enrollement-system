import { PlusIcon } from "@heroicons/react/24/solid"
import { Button, NumberInput, TextInput } from "@mantine/core"
import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { badRequest } from "remix-utils"
import { z } from "zod"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"
import { validateAction, type inferErrors } from "~/utils/validation"

const EditRoomSchema = z.object({
  roomId: z.string().optional(),
  number: z.string().min(3, "Name must be at least 3 characters"),
  maxCapacity: z.string().min(1, "Max Capacity is required"),
})

export async function loader({ params }: LoaderArgs) {
  const roomToEdit = await prisma.room.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!roomToEdit) {
    return redirect("/admin/rooms")
  }

  const rooms = await prisma.room.findMany({})
  return json({ rooms, roomToEdit })
}

interface ActionData {
  success: boolean
  fieldErrors?: inferErrors<typeof EditRoomSchema>
}

export const action: ActionFunction = async ({ request }) => {
  const { fields, fieldErrors } = await validateAction(request, EditRoomSchema)

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors })
  }

  const { number, maxCapacity, roomId } = fields

  const rommWithSameNumber = await prisma.room.findFirst({
    where: {
      no: {
        equals: number,
      },
      NOT: {
        id: roomId,
      },
    },
  })

  if (rommWithSameNumber) {
    return badRequest<ActionData>({
      success: false,
      fieldErrors: {
        number: "Room with this number already exists",
      },
    })
  }

  await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      no: number,
      maxCapacity: parseInt(maxCapacity),
    },
  })

  return redirect("/admin/rooms")
}

export default function AdminSections() {
  const { roomToEdit } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<ActionData>()

  const isSubmitting = fetcher.state !== "idle"
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
              <Button
                variant="filled"
                color="gray"
                loaderPosition="left"
                type="submit"
                form="form"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="ml-2">Update</span>
              </Button>
            </div>
          </div>
        </div>
      </TailwindContainer>
      <div className="p-8 grid grid-cols-2 gap-12">
        <fetcher.Form
          id="form"
          method="post"
          replace
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            fetcher.submit(formData, {
              method: "post",
              replace: true,
            })
          }}
        >
          <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
            <input type="hidden" name="roomId" value={roomToEdit?.id} />
            <TextInput
              name="number"
              type="text"
              label="Room No."
              defaultValue={roomToEdit?.no}
              error={fetcher.data?.fieldErrors?.number}
              required
            />
            <NumberInput
              name="maxCapacity"
              label="Max Capacity"
              defaultValue={roomToEdit?.maxCapacity}
              error={fetcher.data?.fieldErrors?.maxCapacity}
              required
            />
          </fieldset>
        </fetcher.Form>
      </div>
    </>
  )
}
