import { SearchPage } from "@/app/_pages/Search";

interface Props {
  params: Promise<{ query: string }>;
}

export default async function SearchPageRoute({ params }: Props) {
  const query = (await params).query;
  return <SearchPage query={query} />;
}
