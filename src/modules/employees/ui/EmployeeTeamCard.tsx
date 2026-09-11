import Image from "next/image";
import Link from "next/link";
import { EmployeeCardView } from "@ams/realty-ui";
import type { ReactNode } from "react";
import type { EmployeeListItem } from "../types";
import { EMPLOYEE_PORTRAIT_PLACEHOLDER } from "../photo-policy";
import { EmployeePhoneAction } from "./EmployeePhoneAction";

function EmployeeLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return <Link href={href} className={className}>{children}</Link>;
}

function EmployeeImage({ src, alt, className, sizes, fill, unoptimized }: { src: string; alt: string; className?: string; sizes?: string; fill?: boolean; unoptimized?: boolean }) {
  return <Image src={src} alt={alt} fill={fill} unoptimized={unoptimized} sizes={sizes} className={className} />;
}

export function EmployeeTeamCard({
  employee,
  showPhoneAction,
}: {
  employee: EmployeeListItem;
  showPhoneAction?: boolean;
}) {
  const profileHref = `/sotrudniki/${employee.slug}`;
  const showsPhoneAction = showPhoneAction ?? employee.teamSection !== "office";
  const imageSrc = employee.photoUrl || EMPLOYEE_PORTRAIT_PLACEHOLDER;

  return (
    <EmployeeCardView
      profileHref={profileHref}
      fullName={employee.fullName}
      position={employee.position}
      summary={employee.publicSummary}
      imageSrc={imageSrc}
      imageAlt={employee.photoUrl ? employee.fullName : ""}
      imageClassName={employee.photoUrl ? "object-cover object-top" : "bg-[var(--employee-team-card-surface-primary)] object-contain object-bottom"}
      profileLabel="Открыть профиль"
      phoneAction={showsPhoneAction ? <EmployeePhoneAction phone={employee.phone} slug={employee.slug} compact /> : null}
      linkRenderer={EmployeeLink}
      imageRenderer={EmployeeImage}
    />
  );
}
