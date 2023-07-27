/* eslint-disable @typescript-eslint/no-unused-vars */
import { PlusIcon } from "@heroicons/react/24/solid"
import { Button, NumberInput, Select, TextInput } from "@mantine/core"
import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { badRequest } from "remix-utils"
import { z } from "zod"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"
import type { inferErrors } from "~/utils/validation"
import { validateAction } from "~/utils/validation"
import * as React from "react"
import PageHeading from "~/components/page-heading"

const CreateCourseSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  code: z.string().min(3, "Code must be at least 3 characters"),
  credit_hours: z.string().min(1, "Credit hours must be at least 3"),
})

interface ActionData {
  success: boolean
  fieldErrors?: inferErrors<typeof CreateCourseSchema>
}

export const action: ActionFunction = async ({ request }) => {
  const { fields, fieldErrors } = await validateAction(
    request,
    CreateCourseSchema,
  )

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors })
  }

  const { name, code, credit_hours } = fields

  const courseWithSameName = await prisma.course.findFirst({
    where: {
      name: name,
    },
  })

  const courseWithSameCode = await prisma.course.findFirst({
    where: {
      code: code,
    },
  })

  if (courseWithSameName) {
    return badRequest<ActionData>({
      success: false,
      fieldErrors: {
        name: "Course with same name already exists",
      },
    })
  }

  if (courseWithSameCode) {
    return badRequest<ActionData>({
      success: false,
      fieldErrors: {
        code: "Course with same code already exists",
      },
    })
  }

  await prisma.course.create({
    data: {
      name: name,
      code: code,
      credit_hours: parseInt(credit_hours),
    },
  })

  return redirect("/admin/courses")
}

export default function NewCourse() {
  const fetcher = useFetcher<ActionData>()
  const isSubmitting = fetcher.state !== "idle"

  const [departmentId, setDepartmentId] = React.useState<string>("")
  const [semesterId, setSemesterId] = React.useState<string>("")

  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className=" px-4 py-10 sm:px-6 lg:px-8">
          <PageHeading
            title="Create Course"
            subtitle="Create a new course"
            showBackButton
            to="/admin/courses"
            rightSection={
              <Button
                type="submit"
                form="form"
                variant="filled"
                color="gray"
                loaderPosition="left"
                loading={isSubmitting}
              >
                <PlusIcon className="h-4 w-4" />
                <span className="ml-2">Create</span>
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
              name="name"
              label="Name"
              placeholder="Enter the name"
              error={fetcher.data?.fieldErrors?.name}
              required
            />
            <TextInput
              name="code"
              label="Code"
              placeholder="Enter the code"
              error={fetcher.data?.fieldErrors?.code}
              required
            />
            <NumberInput
              name="credit_hours"
              label="Credit_hours"
              type="text"
              placeholder="Enter the credit_hours"
              error={fetcher.data?.fieldErrors?.credit_hours}
              required
            />
            {/* <Select
              name="departmentId"
              label="Department"
              onChange={(e) => {
                setDepartmentId(e as string)
              }}
              data={departments.map((department) => ({
                value: department.id,
                label: department.name,
              }))}
              error={fetcher.data?.fieldErrors?.departmentId}
              required
            />
            <Select
              name="semesterId"
              label="Semester"
              onChange={(e) => {
                setSemesterId(e as string)
              }}
              error={fetcher.data?.fieldErrors?.semesterId}
              data={semesters.map((semester) => ({
                value: semester.id,
                label: semester.name,
              }))}
              required
            /> */}
          </fieldset>
        </fetcher.Form>
      </div>
    </>
  )
}
