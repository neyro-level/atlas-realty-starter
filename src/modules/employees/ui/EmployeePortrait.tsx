import Image from "next/image";
import { EMPLOYEE_PORTRAIT_PLACEHOLDER } from "../photo-policy";

export function EmployeePortrait({
  photoUrl,
  fullName,
  priority = false,
  sizes = "(min-width: 1024px) 360px, 100vw",
}: {
  photoUrl: string | null;
  fullName: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={fullName}
        fill
        priority={priority}
        unoptimized={photoUrl.startsWith("http")}
        sizes={sizes}
        className="object-cover object-top"
      />
    );
  }

  return (
    <Image
      src={EMPLOYEE_PORTRAIT_PLACEHOLDER}
      alt=""
      fill
      priority={priority}
      sizes={sizes}
      className="bg-[var(--employee-portrait-surface-primary)] object-contain object-bottom"
    />
  );
}
