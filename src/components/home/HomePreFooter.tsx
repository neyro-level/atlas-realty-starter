import Link from "next/link";
import { type SiteLinkRendererProps } from "@starter/site-ui/contracts";
import { HomePreFooterView } from "@starter/site-ui/views";
import { popularSearchGroups } from "@/components/marketing/PopularSearchesSection";

function HomeLink({ href, children, ariaLabel, ...props }: SiteLinkRendererProps) { return <Link href={href} aria-label={ariaLabel} {...props}>{children}</Link>; }
export function HomePreFooter() { return <HomePreFooterView groups={popularSearchGroups} linkRenderer={HomeLink} />; }
