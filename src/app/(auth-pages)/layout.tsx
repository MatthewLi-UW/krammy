export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-beige-light flex flex-col gap-12">{children}</div>
  );
}
