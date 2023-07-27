import { Card, Text } from "@mantine/core"
import type { LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Outlet, useLoaderData, useMatches } from "@remix-run/react"
import { prisma } from "~/lib/db.server"

export async function loader({ params }: LoaderArgs) {
  const { sectionId } = params

  if (!sectionId) {
    return redirect("/faculty/sections")
  }

  const section = await prisma.section.findUnique({
    where: {
      id: sectionId,
    },
    include: {
      course: true,
      room: true,
    },
  })

  if (!section) {
    return redirect("/faculty/sections")
  }

  return json({ section })
}

export default function SectionDetails() {
  const { section } = useLoaderData<typeof loader>()
  const matches = useMatches()
  const isSectionIndexRoute = matches.some((match) =>
    match.id.endsWith("$sectionId+/_index"),
  )
  return (
    <>
      {!isSectionIndexRoute && (
        <div>
          <Card shadow="sm" radius="md" withBorder>
            <Text weight={500}>Name: {section?.name} </Text>
            <Text weight={500}>Code: {section?.code} </Text>
            <Text weight={500}>Course: {section?.course.name} </Text>
            <Text weight={500}>Room: {section?.room.no} </Text>
            {/* <Text weight={500}>
              Time Slots:
              {section?.timeSlots.map((timeSlot) => (
                <div key={timeSlot.id}>
                  {timeSlot.day}: {formatTime(timeSlot.startTime)} -{" "}
                  {formatTime(timeSlot.endTime)}
                </div>
              ))}
            </Text> */}
          </Card>
        </div>
      )}
      <Outlet />
    </>
  )
}
