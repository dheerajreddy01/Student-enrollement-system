/* eslint-disable @typescript-eslint/no-unused-vars */
import { PlusIcon } from "@heroicons/react/24/solid"
import { Button, PasswordInput, Select, TextInput } from "@mantine/core"
import type { ActionFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import * as React from "react"
import { badRequest } from "remix-utils"
import { z } from "zod"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"
import { createPasswordHash } from "~/session.server"
import { validateAction, type inferErrors } from "~/utils/validation"

const CreateFacultySchema = z
  .object({
    facultyId: z.string().optional(),
    name: z.string().min(3, "Name must be at least 3 characters"),
    departmentId: z.string(),
    email: z.string().email("Please enter a valid email"),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.facultyId && !data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required",
        path: ["password"],
      })

      return z.NEVER
    }

    if (data.password) {
      if (data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must be at least 8 characters",
          path: ["password"],
        })

        return z.NEVER
      }
    }
  })

// export async function loader() {
//   const departments = await prisma.department.findMany({})
//   return json({ departments })
// }

interface ActionData {
  success: boolean
  fieldErrors?: inferErrors<typeof CreateFacultySchema>
}

export const action: ActionFunction = async ({ request }) => {
  const { fields, fieldErrors } = await validateAction(
    request,
    CreateFacultySchema,
  )

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors })
  }

  const { email, name, password, departmentId } = fields

  await prisma.faculty.create({
    data: {
      email,
      name,
      password: await createPasswordHash(password!),
    },
  })

  return redirect("/admin/faculties")
}

export default function CreateFaculty() {

  const fetcher = useFetcher<ActionData>()

  const [departmentId, setDepartmentId] = React.useState<string | null>(null)

  const isSubmitting = fetcher.state !== "idle"

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
              <Button
                type="submit"
                form="form"
                variant="filled"
                color="gray"
                loading={isSubmitting}
                loaderPosition="left"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="ml-2">Create</span>
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
            <TextInput
              name="name"
              label="Name"
              error={fetcher.data?.fieldErrors?.name}
              required
            />
            {/* <Select
              name="departmentId"
              label="Department"
              placeholder="Select the department"
              onChange={(e) => setDepartmentId(e as string)}
              error={fetcher.data?.fieldErrors?.departmentId}
              data={departments.map((department) => ({
                value: department.id,
                label: department.name,
              }))}
              required
            /> */}
            <TextInput
              name="email"
              type="email"
              label="Email"
              placeholder="Enter the email"
              error={fetcher.data?.fieldErrors?.email}
              required
            />
            <PasswordInput
              name="password"
              label="Password"
              placeholder="Enter a password"
              error={fetcher.data?.fieldErrors?.password}
              required
            />
          </fieldset>
        </fetcher.Form>
      </div>
    </>
  )
}
