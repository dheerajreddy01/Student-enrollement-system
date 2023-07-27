/* eslint-disable @typescript-eslint/no-unused-vars */
import { PlusIcon } from "@heroicons/react/24/solid"
import { Button, NumberInput, TextInput } from "@mantine/core"
import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { badRequest } from "remix-utils"
import { z } from "zod"
import PageHeading from "~/components/page-heading"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"
import type { inferErrors } from "~/utils/validation"
import { validateAction } from "~/utils/validation"

const EditCourseSchema = z.object({
  courseId: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  credit_hours: z.string().min(1, "Credit hours must be at least 3"),
})

export async function loader({ params }: LoaderArgs) {
  const courseToEdit = await prisma.course.findFirst({
    where: {
      id: params.id,
    },
  })

  if (!courseToEdit) {
    return redirect("/admin/courses")
  }

  return json({ courseToEdit })
}

interface ActionData {
  success: boolean
  fieldErrors?: inferErrors<typeof EditCourseSchema>
}

export const action: ActionFunction = async ({ request }) => {
  const { fields, fieldErrors } = await validateAction(
    request,
    EditCourseSchema,
  )

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors })
  }

  const { name, credit_hours, courseId } = fields

  await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      name: name,
      credit_hours: parseInt(credit_hours),
    },
  })

  return redirect("/admin/courses")
}

export default function EditCourse() {
  const { courseToEdit } = useLoaderData<typeof loader>()

  const fetcher = useFetcher<ActionData>()
  const isSubmitting = fetcher.state !== "idle"

  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className=" px-4 py-10 sm:px-6 lg:px-8">
          <PageHeading
            title="Edit Course"
            subtitle="Edit the course."
            showBackButton
            to="/admin/courses"
            rightSection={
              <Button
                type="submit"
                form="form"
                variant="filled"
                color="gray"
                loading={isSubmitting}
                loaderPosition="left"
              >
                Update
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
            <input hidden name="courseId" defaultValue={courseToEdit?.id} />
            <TextInput
              name="name"
              label="Name"
              placeholder="Enter the name"
              defaultValue={courseToEdit?.name}
              error={fetcher.data?.fieldErrors?.name}
              required
            />

            <TextInput
              readOnly
              name="code"
              label="Code"
              defaultValue={courseToEdit?.code}
              placeholder="Enter the code"
              disabled
            />
            <NumberInput
              name="credit_hours"
              label="Credit_hours"
              type="text"
              placeholder="Enter the credit_hours"
              defaultValue={courseToEdit?.credit_hours}
              error={fetcher.data?.fieldErrors?.credit_hours}
              required
            />
            {/* <Select
              name="departmentId"
              label="Department"
              defaultValue={courseToEdit?.departmentId}
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
              defaultValue={courseToEdit?.semesterId}
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
