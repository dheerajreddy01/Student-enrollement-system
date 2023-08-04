import { Button, Modal, TextInput } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import type { LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Outlet, useFetcher, useLoaderData } from "@remix-run/react"
import { DashboardLayout } from "~/components/dashboard-layout"
import { getFacultyById } from "~/models/faculty.server"
import { isAdmin, isStudent, requireUserId } from "~/session.server"
import { useFaculty } from "~/utils/hooks"
import * as React from "react"

const actions = [
  {
    title: "Sections",
    description: "Manage Sections",
    href: "/faculty/sections",
  },
]

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request)
  const faculty = await getFacultyById(userId)

  if (await isAdmin(request)) {
    return redirect("/admin")
  } else if (await isStudent(request)) {
    return redirect("/student")
  }

  const hasResetPassword = Boolean(faculty?.lastPasswordResetAt)
  return json({ hasResetPassword })
}

export default function FacultyDashboard() {
  const user = useFaculty()
  const fetcher = useFetcher()
  const { hasResetPassword } = useLoaderData<typeof loader>()
  const [isModalOpen, handleModal] = useDisclosure(!hasResetPassword)

  const isSubmitting = fetcher.state !== "idle"

  React.useEffect(() => {
    if (fetcher.type !== "done") {
      return
    }

    if (!fetcher.data.success) {
      return
    }

    handleModal.close()
  }, [fetcher.data, fetcher.type, handleModal])
  return (
    <>
      <DashboardLayout
        navItems={actions}
        userName={user.name}
        userEmail={user.email}
      >
        <Outlet />
      </DashboardLayout>

      <Modal
        opened={isModalOpen}
        onClose={handleModal.close}
        title="Reset Password"
        centered
        overlayProps={{ blur: 1.2, opacity: 0.6 }}
        withCloseButton={hasResetPassword}
        closeOnEscape={hasResetPassword}
        closeOnClickOutside={hasResetPassword}
      >
        <fetcher.Form
          method="post"
          replace
          className="flex flex-col gap-4"
          action="/api/reset-password"
        >
          <div className="mt-6 grid grid-cols-2 gap-4">
            <input hidden name="userId" defaultValue={user.id} />
            <TextInput
              required
              name="password"
              type="password"
              placeholder="Password"
            />

            <Button
              variant="filled"
              type="submit"
              fullWidth
              loading={isSubmitting}
              loaderPosition="right"
            >
              Update
            </Button>
          </div>
        </fetcher.Form>
      </Modal>
    </>
  )
}
