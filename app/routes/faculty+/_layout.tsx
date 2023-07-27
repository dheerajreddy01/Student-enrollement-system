import type { LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import { DashboardLayout } from "~/components/dashboard-layout"
import { isAdmin, isStudent, requireUserId } from "~/session.server"
import { useFaculty } from "~/utils/hooks"
const actions = [
  {
    title: "Sections",
    description: "Manage Sections",
    href: "/faculty/sections",
  },
]

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request)

  if (await isAdmin(request)) {
    return redirect("/admin")
  } else if (await isStudent(request)) {
    return redirect("/student")
  }
  return json({})
}

export default function FacultyDashboard() {
  const user = useFaculty()
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
