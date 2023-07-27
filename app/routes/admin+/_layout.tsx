import type { LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import { DashboardLayout } from "~/components/dashboard-layout"
import { prisma } from "~/lib/db.server"
import { isFaculty, isStudent, requireUserId } from "~/session.server"
import { useAdmin } from "~/utils/hooks"

const actions = [
  {
    title: "Courses",
    description: "Manage courses",
    href: "/admin/courses",
  },
  {
    title: "Faculty",
    description: "Manage faculty",
    href: "/admin/faculties",
  },
  {
    title: "Students",
    description: "Manage students",
    href: "/admin/students",
  },
  {
    title: "Sections",
    description: "Manage sections",
    href: "/admin/sections",
  },
  {
    title: "Rooms",
    description: "Manage rooms",
    href: "/admin/rooms",
  },
]

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request)

  if (await isFaculty(request)) {
    return redirect("/faculty")
  } else if (await isStudent(request)) {
    return redirect("/student")
  }

  const [sections] = await Promise.all([
    prisma.section.findMany({

    }),
  ])

  return json({
    sections,
  })
}

export default function AdminDashboard() {
  const user = useAdmin()

  return (
    <DashboardLayout
      navItems={actions}
      userName={user.name}
      userEmail={user.email}
    >
      <Outlet />
    </DashboardLayout>
  )
}
