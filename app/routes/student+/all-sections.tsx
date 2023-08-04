import { Button, Card, Text } from "@mantine/core"
import type { ActionArgs, SerializeFrom } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { appConfig } from "app.config"
import * as React from "react"
import { badRequest } from "remix-utils"
import { toast } from "sonner"
import PageHeading from "~/components/page-heading"
import { TailwindContainer } from "~/components/tailwind-container"
import { prisma } from "~/lib/db.server"
import { requireUserId } from "~/session.server"
import { formatTime } from "~/utils"
import { useStudent } from "~/utils/hooks"

export async function loader() {
  const courses = await prisma.course.findMany({
    include: {
      sections: {
        include: {
          faculty: true,
          room: true,
          schedules: true,
          enrollments: true,
        },
      },
    },
  })
  return json({ courses })
}
export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const studentId = await requireUserId(request)

  const sectionId = formData.get("sectionId")?.toString()
  const courseId = formData.get("courseId")?.toString()

  if (!sectionId || !courseId) {
    return badRequest({
      success: false,
      message: "Invalid request",
    })
  }

  const isAlreadyEnrolledInSomeSection = await prisma.enrollment.findFirst({
    where: {
      studentId,
      section: {
        courseId,
      },
    },
  })

  if (isAlreadyEnrolledInSomeSection) {
    return badRequest({
      success: false,
      message: "You are already enrolled in one section of this course",
    })
  }

  await prisma.enrollment.create({
    data: {
      sectionId,
      studentId,
    },
  })

  return redirect("/student/my-sections")
}

export default function ManageSections() {
  const { courses } = useLoaderData<typeof loader>()

  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className=" px-4 py-10 sm:px-6 lg:px-8">
          <PageHeading
            title="View sections"
            subtitle="A list of all the sections."
          />
          <div className="mt-8">
            {courses.length > 0 ? (
              <div className="flex flex-col gap-12">
                {courses.map((course) => (
                  <CourseRow key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <>
                <p>No courses to display.</p>
              </>
            )}
          </div>
        </div>
      </TailwindContainer>
    </>
  )
}

function CourseRow({
  course,
}: {
  course: SerializeFrom<typeof loader>["courses"][0]
}) {
  const student = useStudent()
  const fetcher = useFetcher<typeof action>()

  const isSubmitting = fetcher.state !== "idle"
  const isEnrolledInSomeSection = course.sections.some((section) =>
    section.enrollments.some(
      (enrollment) => enrollment.studentId === student.id,
    ),
  )

  React.useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) {
      return
    }

    if (fetcher.data.success) {
      toast.success("Enrolled successfully")
    } else {
      toast.error(fetcher.data.message)
    }
  }, [fetcher.data, fetcher.state])

  return (
    <div className="flex flex-col gap-8">
      <Text weight={500} className="border-b pb-4">
        Course: {course.name} ({course.code})
      </Text>

      <div className="overflow-x-auto max-w-full">
        <div className="grid grid-flow-col gap-8 overflow-x-auto w-max">
          {course.sections.length > 0 ? (
            course.sections.map((section) => {
              const isEnrolledInThisSection = section.enrollments.some(
                (enrollment) => enrollment.studentId === student.id,
              )
              const isEnrolling =
                fetcher.submission?.formData?.get("sectionId") === section.id

              if (appConfig.showOtherSectionIfAlreadyEnrolledInCourse == true) {
                if (isEnrolledInSomeSection && !isEnrolledInThisSection)
                  return null
              }

              return (
                <Card shadow="sm" radius="md" withBorder key={section.id}>
                  <div className="flex-1">
                    <Text weight={500}>Section: {section.name}</Text>
                    <Text weight={500}>Faculty: {section.faculty.name}</Text>
                    <Text weight={500}>Room: {section.room.no}</Text>
                    <Text weight={500}>
                      Schedule:{" "}
                      {section.schedules.map((schedule) => (
                        <div key={schedule.id}>
                          <div>
                            {schedule.day} {formatTime(schedule.startTime)} -{" "}
                            {formatTime(schedule.endTime)}
                          </div>
                        </div>
                      ))}
                    </Text>
                  </div>
                  <div className="flex items-center justify-center mt-auto">
                    <Button
                      variant="subtle"
                      color="teal"
                      loading={isSubmitting && isEnrolling}
                      disabled={
                        isEnrolledInSomeSection ||
                        (isSubmitting && !isEnrolling)
                      }
                      onClick={() =>
                        fetcher.submit(
                          {
                            sectionId: section.id,
                            courseId: course.id,
                          },
                          {
                            method: "post",
                            replace: true,
                          },
                        )
                      }
                    >
                      {isEnrolledInSomeSection
                        ? isEnrolledInThisSection
                          ? "Enrolled"
                          : "Already enrolled in another section"
                        : "Enroll"}
                    </Button>
                  </div>
                </Card>
              )
            })
          ) : (
            <p>No sections to display </p>
          )}
        </div>
      </div>
    </div>
  )
}
