import Link from "next/link";
import { HomePreFooterView, type SiteLinkRendererProps } from "@ams/realty-ui";
import { popularSearchGroups } from "@/components/marketing/PopularSearchesSection";

function HomeLink({ href, children, ariaLabel, ...props }: SiteLinkRendererProps) { return <Link href={href} aria-label={ariaLabel} {...props}>{children}</Link>; }
export function HomePreFooter() { return <HomePreFooterView groups={popularSearchGroups} linkRenderer={HomeLink} />; }
