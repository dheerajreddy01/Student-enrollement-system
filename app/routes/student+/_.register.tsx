import { PasswordInput, Select, TextInput } from "@mantine/core"
import { DateInput } from "@mantine/dates"
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react"
import { useEffect, useRef } from "react"
import { EducationLevel } from "~/education_level"
import { createStudent } from "~/models/student.server"
import { UserRole } from "~/roles"
import {
  createUserSession,
  getUserId,
  getUserRole,
  isAdmin,
  isFaculty,
} from "~/session.server"
import { safeRedirect, validateEmail } from "~/utils"

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  const userRole = await getUserRole(request)

  if (!userId || !userRole) {
    return null
  }

  if (await isAdmin(request)) {
    return redirect("/admin")
  }

  if (await isFaculty(request)) {
    return redirect("/faculty")
  }

  return null
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()
  const email = formData.get("email")?.toString().trim()
  const password = formData.get("password")?.toString().trim()
  const name = formData.get("name")?.toString().trim()
  const banner_no = formData.get("banner_no")?.toString().trim()
  const dob = formData.get("dob")?.toString().trim()
  const address = formData.get("address")?.toString().trim()
  const phone_no = formData.get("phone_no")?.toString().trim()
  const education_level = formData.get("education_level")?.toString().trim()
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/student")

  if (!validateEmail(email)) {
    return json(
      {
        errors: {
          email: "Email is invalid",
          password: null,
          banner_no: null,
          name: null,
          dob: null,
          address: null,
          phone_no: null,
          education_level: null,
        },
      },
      { status: 400 },
    )
  }

  if (!password || password.length === 0) {
    return json(
      {
        errors: {
          email: null,
          password: "Password is required",
          banner_no: null,
          name: null,
          dob: null,
          address: null,
          phone_no: null,
          education_level: null,
        },
      },
      { status: 400 },
    )
  }

  if (password.length < 8) {
    return json(
      {
        errors: {
          email: null,
          password: "Password is too short",
          banner_no: null,
          name: null,
          dob: null,
          address: null,
          phone_no: null,
          education_level: null,
        },
      },
      { status: 400 },
    )
  }

  if (!name || name.length === 0) {
    return json(
      {
        errors: {
          name: "Name is required",
          email: null,
          password: null,
          banner_no: null,
          dob: null,
          address: null,
          phone_no: null,
          education_level: null,
        },
      },
      { status: 400 },
    )
  }

  if (!banner_no || banner_no.length === 0) {
    return json(
      {
        errors: {
          name: null,
          banner_no: "Banner Number is required",
          email: null,
          password: null,
          dob: null,
          address: null,
          phone_no: null,
          education_level: null,
        },
      },
      { status: 400 },
    )
  }

  if (!banner_no || banner_no.length !== 9) {
    return json(
      {
        errors: {
          banner_no: "Banner Number must be 9 digits",
          name: null,
          email: null,
          password: null,
          dob: null,
          address: null,
          phone_no: null,
          education_level: null,
        },
      },
      { status: 400 },
    )
  }

  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(String(dob))) {
    return json(
      {
        errors: {
          dob: "Date of Birth is required and should be in format YYYY-MM-DD",
          name: null,
          email: null,
          password: null,
          banner_no: null,
          address: null,
          phone_no: null,
          education_level: null,
        },
      },
      { status: 400 },
    )
  }

  if (!address || address.length === 0) {
    return json(
      {
        errors: {
          address: "Address is required",
          dob: null,
          name: null,
          email: null,
          password: null,
          banner_no: null,
          phone_no: null,
          education_level: null,
        },
      },
      { status: 400 },
    )
  }

  if (!phone_no || phone_no.length === 0) {
    return json(
      {
        errors: {
          phone_no: "Phone Number is required",
          address: null,
          dob: null,
          name: null,
          email: null,
          password: null,
          banner_no: null,
          education_level: null,
        },
      },
      { status: 400 },
    )
  }

  if (!education_level) {
    return json(
      {
        errors: {
          phone_no: null,
          address: null,
          dob: null,
          name: null,
          email: null,
          password: null,
          banner_no: null,
          education_level: "Education Level is required",
        },
      },
      { status: 400 },
    )
  }

  const user = await createStudent({
    email,
    password,
    name,
    banner_no,
    dob: new Date(String(dob)),
    address,
    phone_no,
    education_level,
  })

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user.id,
    role: UserRole.STUDENT,
  })
}

export const meta: V2_MetaFunction = () => [{ title: "Sign Up" }]

export default function Register() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") ?? undefined
  const actionData = useActionData<typeof action>()
  const emailRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)
  const dobRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const educationLevelRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus()
    } else if (actionData?.errors?.name) {
      nameRef.current?.focus()
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus()
    } else if (actionData?.errors?.banner_no) {
      bannerRef.current?.focus()
    } else if (actionData?.errors?.dob) {
      dobRef.current?.focus()
    } else if (actionData?.errors?.address) {
      addressRef.current?.focus()
    } else if (actionData?.errors?.phone_no) {
      phoneRef.current?.focus()
    } else if (actionData?.errors?.education_level) {
      educationLevelRef.current?.focus()
    }
  }, [actionData?.errors])

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <TextInput
            id="name"
            ref={nameRef}
            name="name"
            type="text"
            label="Name"
            autoComplete="new-name"
            aria-invalid={actionData?.errors?.name ? true : undefined}
            aria-describedby="name-error"
          />
          {actionData?.errors?.name ? (
            <div className="pt-1 text-red-700" id="name-error">
              {actionData.errors.name}
            </div>
          ) : null}

          <TextInput
            ref={emailRef}
            id="email"
            required
            autoFocus={true}
            name="email"
            type="email"
            label="Email Address"
            aria-invalid={actionData?.errors?.email ? true : undefined}
            aria-describedby="email-error"
          />
          {actionData?.errors?.email ? (
            <div className="pt-1 text-red-700" id="email-error">
              {actionData.errors.email}
            </div>
          ) : null}

          <PasswordInput
            id="password"
            ref={passwordRef}
            name="password"
            type="password"
            label="Password"
            aria-invalid={actionData?.errors?.password ? true : undefined}
            aria-describedby="password-error"
          />
          {actionData?.errors?.password ? (
            <div className="pt-1 text-red-700" id="password-error">
              {actionData.errors.password}
            </div>
          ) : null}

          <TextInput
            id="banner_no"
            ref={bannerRef}
            name="banner_no"
            type="text"
            label="Banner Number"
            aria-invalid={actionData?.errors?.banner_no ? true : undefined}
            aria-describedby="banner_no-error"
          />
          {actionData?.errors?.banner_no ? (
            <div className="pt-1 text-red-700" id="banner_no-error">
              {actionData.errors.banner_no}
            </div>
          ) : null}

          <DateInput
            id="dob"
            ref={dobRef}
            name="dob"
            type="date"
            label="Date of Birth"
            aria-invalid={actionData?.errors?.dob ? true : undefined}
            aria-describedby="dob-error"
          />
          {actionData?.errors?.dob ? (
            <div className="pt-1 text-red-700" id="dob-error">
              {actionData.errors.dob}
            </div>
          ) : null}

          <TextInput
            id="address"
            ref={addressRef}
            name="address"
            type="text"
            label="Address"
            aria-invalid={actionData?.errors?.address ? true : undefined}
            aria-describedby="banner_no-error"
          />
          {actionData?.errors?.address ? (
            <div className="pt-1 text-red-700" id="address-error">
              {actionData.errors.address}
            </div>
          ) : null}

          <TextInput
            id="phone_no"
            ref={phoneRef}
            name="phone_no"
            type="text"
            label="Phone Number"
            aria-invalid={actionData?.errors?.phone_no ? true : undefined}
            aria-describedby="banner_no-error"
          />
          {actionData?.errors?.phone_no ? (
            <div className="pt-1 text-red-700" id="phone_no-error">
              {actionData.errors.phone_no}
            </div>
          ) : null}

          <Select
            name="education_level"
            id="education_level"
            label="Education Level"
            data={
              [
                Object.values(EducationLevel).map((level) => ({
                  value: level,
                  label: level,
                })),
              ][0]
            }
            required
          />
          {actionData?.errors?.education_level ? (
            <div className="pt-1 text-red-700" id="education_level-error">
              {actionData.errors.education_level}
            </div>
          ) : null}

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Create Account
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/student/login",
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
