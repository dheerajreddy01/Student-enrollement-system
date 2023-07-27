import type { LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import { DashboardLayout } from "~/components/dashboard-layout"
import { isAdmin, isFaculty, requireUserId } from "~/session.server"
import { useStudent } from "~/utils/hooks"

const actions = [
  {
    title: "My Sections",
    description: "Manage sections",
    href: "/student/my-sections",
  },
  {
    title: "All Sections",
    description: "View all sections",
    href: "/student/all-sections",
  },
]

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request)

  if (await isAdmin(request)) {
    return redirect("/admin")
  } else if (await isFaculty(request)) {
    return redirect("/faculty")
  }
  return json({})
}

export default function StudentDashboard() {
  const user = useStudent()
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
