import Image from "next/image";
import {
  Bell,
  Globe,
  Mail,
  Menu,
  Monitor,
  PlusCircle,
  RotateCcw,
  Star,
  KeyRound,
} from "lucide-react";
import { auth } from "@/auth";

export default async function Header() {
  const session = await auth();
  const user = {
    name: session?.user?.name ?? "User",
    alias: session?.user?.email?.split("@")[0] ?? "",
    avatarUrl: session?.user?.avatar ?? "",
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className=" flex h-14 justify-between ">
        <div className="flex items-center gap-3 text-gray-600">
          <IconBtn aria-label="Menu">
            <Menu className="h-5 w-5" />
          </IconBtn>
          <IconBtn aria-label="Refresh">
            <RotateCcw className="h-5 w-5" />
          </IconBtn>
          <IconBtn aria-label="Favorites">
            <Star className="h-5 w-5" />
          </IconBtn>
          <IconBtn aria-label="Display">
            <Monitor className="h-5 w-5" />
          </IconBtn>

          <button className="ml-2 inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#6d28d9]">
            <KeyRound className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <IconBtn aria-label="New">
            <PlusCircle className="h-5 w-5" />
          </IconBtn>
          <IconBtn aria-label="Language">
            <Globe className="h-5 w-5" />
          </IconBtn>
          <IconBtn aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </IconBtn>
          <IconBtn aria-label="Inbox">
            <Mail className="h-5 w-5" />
          </IconBtn>

          <div className="ml-1 flex items-center gap-2 pl-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="hidden text-sm font-medium text-gray-700 sm:block">
              {user.name} {user.alias ? `(${user.alias})` : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function IconBtn({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
      {...rest}
    >
      {children}
    </button>
  );
}
