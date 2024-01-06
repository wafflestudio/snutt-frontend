export async function GET() {
  return Response.json({ content: [{ data: '1' }], total_count: 0 });
}
