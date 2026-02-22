import { Redirect, useLocalSearchParams } from "expo-router";

export default function CustomerIndex() {
  const { table } = useLocalSearchParams();

  if (!table) return null;

  return <Redirect href={`/customer/menu?table=${table}`} />;
}