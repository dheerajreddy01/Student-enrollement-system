import type { ActionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { prisma } from "~/lib/db.server"
import { createPasswordHash } from "~/session.server"

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()

  const userId = formData.get("userId")?.toString()
  const password = formData.get("password")?.toString()

  if (!userId || !password) {
    return json(
      { success: false, error: "Missing userId or password" },
      { status: 400 },
    )
  }

  await prisma.faculty.update({
    where: { id: userId },
    data: {
      password: await createPasswordHash(password),
      lastPasswordResetAt: new Date(),
    },
  })

  return json({ success: true })
}
