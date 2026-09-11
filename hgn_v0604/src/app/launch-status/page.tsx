export default function LaunchStatusPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">Launch Status</h1>
      <div className="mt-6 rounded-xl border p-4">
        <p className="text-sm">
          HGN is currently in a controlled admin/editor beta workflow.
        </p>
        <ul className="mt-4 list-disc pl-5 text-sm space-y-2">
          <li>Publishing workflow stabilized</li>
          <li>Homepage consolidation underway</li>
          <li>Mobile review in progress</li>
          <li>Feature freeze preparation active</li>
        </ul>
      </div>
    </main>
  );
}
