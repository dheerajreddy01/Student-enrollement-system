import { PlusIcon } from "@heroicons/react/24/solid"
import { Button, NumberInput, TextInput } from "@mantine/core"
import type { ActionFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useFetcher } from "@remix-run/react"
import { badRequest } from "remix-utils"
import { z } from "zod"
import PageHeading from "~/components/page-heading"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"
import { validateAction, type inferErrors } from "~/utils/validation"

const CreateRoomSchema = z.object({
  number: z.string().min(3, "Name must be at least 3 characters"),
  maxCapacity: z.string().min(1, "Max Capacity is required"),
})

export async function loader() {
  const rooms = await prisma.room.findMany({})
  return json({ rooms })
}

interface ActionData {
  success: boolean
  fieldErrors?: inferErrors<typeof CreateRoomSchema>
}

export const action: ActionFunction = async ({ request }) => {
  const { fields, fieldErrors } = await validateAction(
    request,
    CreateRoomSchema,
  )

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors })
  }

  const { number, maxCapacity } = fields

  const roomWithSameNumber = await prisma.room.findFirst({
    where: {
      no: {
        equals: number,
      },
    },
  })

  if (roomWithSameNumber) {
    return badRequest<ActionData>({
      success: false,
      fieldErrors: {
        number: "Room with this number already exists",
      },
    })
  }

  await prisma.room.create({
    data: {
      no: number,
      maxCapacity: parseInt(maxCapacity),
    },
  })

  return redirect("/admin/rooms")
}

export default function AdminSections() {
  const fetcher = useFetcher<ActionData>()

  const isSubmitting = fetcher.state !== "idle"
  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className=" px-4 py-10 sm:px-6 lg:px-8">
          <PageHeading
            title="Create Room"
            subtitle="Create a new room"
            showBackButton
            to="/admin/rooms"
            rightSection={
              <Button
                type="submit"
                form="form"
                loading={isSubmitting}
                loaderPosition="left"
                variant="filled"
                color="gray"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="ml-2">Save</span>
              </Button>
            }
          />
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
            <TextInput
              name="number"
              type="text"
              label="Room No."
              error={fetcher.data?.fieldErrors?.number}
              required
            />
            <NumberInput
              name="maxCapacity"
              label="Max Capacity"
              error={fetcher.data?.fieldErrors?.maxCapacity}
              required
            />
          </fieldset>
        </fetcher.Form>
      </div>
    </>
  )
}
