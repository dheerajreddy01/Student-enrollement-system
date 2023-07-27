import type { SerializeFrom } from "@remix-run/node"
import { useRouteLoaderData } from "@remix-run/react"
import { type RootLoaderData } from "~/root"
import { type loader as adminLoaderData } from "~/routes/admin+/_layout"
import { type loader as sectionLoaderData } from "~/routes/faculty+/sections+/$sectionId+/_layout"
export function useOptionalAdmin() {
  const { admin } = useRouteLoaderData("root") as RootLoaderData
  return admin
}

export function useAdmin() {
  const maybeAdmin = useOptionalAdmin()
  if (!maybeAdmin) {
    throw new Error(
      "No admin found in root loader, but admin is required by useAdmin. If admin is optional, try useOptionalAdmin instead.",
    )
  }

  return maybeAdmin
}

export function useOptionalFaculty() {
  const { faculty } = useRouteLoaderData("root") as RootLoaderData
  return faculty
}

export function useFaculty() {
  const maybeFaculty = useOptionalFaculty()
  if (!maybeFaculty) {
    throw new Error(
      "No faculty found in root loader, but faculty is required by useFaculty. If faculty is optional, try useOptionalFaculty instead.",
    )
  }

  return maybeFaculty
}

export function useOptionalStudent() {
  const { student } = useRouteLoaderData("root") as RootLoaderData
  return student
}

export function useStudent() {
  const maybeStudent = useOptionalStudent()
  if (!maybeStudent) {
    throw new Error(
      "No student found in root loader, but student is required by useStudent. If student is optional, try useOptionalStudent instead.",
    )
  }

  return maybeStudent
}

export function useAdminLoaderData() {
  return useRouteLoaderData("routes/admin+/_layout") as SerializeFrom<
    typeof adminLoaderData
  >
}

export function useSectionData() {
  const data = useRouteLoaderData(
    "routes/faculty+/sections+/$sectionId+/_layout",
  ) as SerializeFrom<typeof sectionLoaderData>

  if (!data) {
    throw new Error(
      "You must use `useSectionData()` inside of a route that has a $sectionId route",
    )
  }

  return data
}
