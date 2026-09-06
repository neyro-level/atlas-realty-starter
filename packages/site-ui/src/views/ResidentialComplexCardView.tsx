import { PropertyCardView, type PropertyCardViewProps } from "./PropertyCardView";

export type ResidentialComplexCardViewProps = Omit<PropertyCardViewProps, "cardKind">;

export function ResidentialComplexCardView(props: ResidentialComplexCardViewProps) {
  return <PropertyCardView {...props} cardKind="new-building" />;
}
