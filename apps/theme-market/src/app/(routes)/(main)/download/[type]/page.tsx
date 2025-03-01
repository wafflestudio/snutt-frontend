import { ThemeListPage } from "@/app/_pages/Main/ThemeDownload/ThemeList";

interface Props {
  params: Promise<{ type: string }>;
}

export default async function DownloadBestPageRoute({ params }: Props) {
  const typeQuery = decodeURIComponent((await params).type);

  const type = typeQuery.toUpperCase() === "BEST" ? "BEST" : "FRIENDS";
  return <ThemeListPage type={type} />;
}
