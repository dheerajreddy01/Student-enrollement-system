import { ArrowLeftIcon } from "@heroicons/react/24/solid"
import { ActionIcon } from "@mantine/core"
import { Link } from "@remix-run/react"

type Props = {
  title: string
  subtitle: string
  rightSection?: React.ReactNode
} & (
  | {
      showBackButton: true
      to: string
    }
  | {
      showBackButton?: false
      to?: never
    }
)

export default function PageHeading(props: Props) {
  const { title, subtitle, rightSection, showBackButton } = props

  return (
    <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-4">
          {showBackButton && (
            <ActionIcon component={Link} to={props.to}>
              <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
            </ActionIcon>
          )}
          <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
        </div>

        <p className="mt-2 text-sm text-gray-700">{subtitle}</p>
      </div>
      {rightSection}
    </div>
  )
}
