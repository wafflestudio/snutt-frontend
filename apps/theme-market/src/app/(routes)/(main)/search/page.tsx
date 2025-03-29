import { SearchPage } from "@/app/_pages/Search";

interface Props {
  searchParams: Promise<{ query: string }>;
}

export default async function SearchPageRoute({ searchParams }: Props) {
  const query = decodeURIComponent((await searchParams).query);
  return <SearchPage query={query} />;
}
